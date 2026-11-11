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
    let next = `https://graph.microsoft.com/v1.0/me/messages?$top=${PAGE_SIZE}&$select=id,from,receivedDateTime,internetMessageHeaders&$orderby=receivedDateTime desc`;
    let totalFetched = 0;

    while (next && totalFetched < MAX_EMAILS) {
      const r = await fetch(next, { headers: { Authorization: `Bearer ${access_token}` } });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.error?.message || 'Failed to fetch messages' });

      for (const msg of data.value || []) {
        const email = (msg.from?.emailAddress?.address || '').toLowerCase();
        if (!email) continue;
        const name   = msg.from?.emailAddress?.name || email.split('@')[0];
        const domain = email.split('@')[1] || '';
        const hasUnsub = (msg.internetMessageHeaders || []).some(h => h.name.toLowerCase() === 'list-unsubscribe');
        const date = msg.receivedDateTime ? new Date(msg.receivedDateTime).getTime() : 0;

        if (!senderMap.has(email)) {
          senderMap.set(email, { email, name, domain, count: 0, latestDate: 0, latestMsgId: msg.id, hasUnsubscribe: false });
        }
        const entry = senderMap.get(email);
        entry.count += 1;
        if (date > entry.latestDate) { entry.latestDate = date; entry.latestMsgId = msg.id; }
        if (hasUnsub) entry.hasUnsubscribe = true;
      }

      totalFetched += (data.value || []).length;
      next = data['@odata.nextLink'] || null;
    }

    // Only senders that look like mailing lists (List-Unsubscribe header present)
    const subscriptions = Array.from(senderMap.values())
      .filter(s => s.count >= 2 && s.hasUnsubscribe)
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
