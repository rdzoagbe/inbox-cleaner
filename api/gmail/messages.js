import { inferCategory, inferFrequency, logoColor } from '../_lib/classify.js';

const PAGE_SIZE  = 100;
const MAX_EMAILS = 2000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { access_token } = req.query;
  if (!access_token) return res.status(400).json({ error: 'Missing access_token' });

  try {
    const senderMap = new Map();
    let pageToken = null;
    let totalFetched = 0;

    do {
      const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
      url.searchParams.set('maxResults', PAGE_SIZE);
      url.searchParams.set('q', 'category:promotions OR category:updates OR unsubscribe');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const listData = await listRes.json();
      if (!listRes.ok) return res.status(listRes.status).json({ error: listData.error?.message || 'Failed to fetch messages' });

      const messages = listData.messages || [];
      if (!messages.length) break;

      // Batch fetch headers for this page
      const details = await Promise.all(
        messages.map(m =>
          fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=List-Unsubscribe&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${access_token}` },
          }).then(r => r.json())
        )
      );

      for (const msg of details) {
        const headers = msg.payload?.headers || [];
        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
        const match = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([^\s<]+@[^\s>]+)/);
        const email = match ? match[1].toLowerCase() : '';
        if (!email) continue;

        const nameMatch = fromHeader.match(/^"?([^"<]+)"?\s*</);
        const name = nameMatch ? nameMatch[1].trim() : email.split('@')[0];
        const domain = email.split('@')[1] || '';
        const hasUnsub = headers.some(h => h.name.toLowerCase() === 'list-unsubscribe');
        const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value;
        const date = dateHeader ? new Date(dateHeader).getTime() : 0;

        if (!senderMap.has(email)) {
          senderMap.set(email, {
            email, name, domain,
            count: 0,
            latestDate: 0,
            latestMsgId: msg.id,
            hasUnsubscribe: false,
          });
        }
        const entry = senderMap.get(email);
        entry.count += 1;
        if (date > entry.latestDate) { entry.latestDate = date; entry.latestMsgId = msg.id; }
        if (hasUnsub) entry.hasUnsubscribe = true;
      }

      totalFetched += messages.length;
      pageToken = listData.nextPageToken || null;
    } while (pageToken && totalFetched < MAX_EMAILS);

    const subscriptions = Array.from(senderMap.values())
      .filter(s => s.count >= 2)
      .sort((a, b) => b.count - a.count)
      .map((s, idx) => ({
        id:          idx + 1,
        sender:      s.name,
        email:       s.email,
        totalEmails: s.count,
        latestDate:  s.latestDate,
        latestMsgId: s.latestMsgId,
        category:    inferCategory(s.email, s.name),
        frequency:   inferFrequency(s.count),
        logoInitial: s.name.charAt(0).toUpperCase(),
        logoColor:   logoColor(s.domain),
      }));

    res.status(200).json({ subscriptions, totalScanned: totalFetched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
