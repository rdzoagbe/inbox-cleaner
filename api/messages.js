// Fetches ALL messages for a connected account by following Nylas pagination cursors
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { grant_id } = req.query;
  if (!grant_id) return res.status(400).json({ error: 'Missing grant_id' });

  const apiKey  = process.env.NYLAS_API_KEY;
  const apiUri  = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  // Cap at 2,000 messages to avoid Vercel's 10s timeout on very large inboxes
  const PAGE_SIZE  = 200;
  const MAX_EMAILS = 2000;

  try {
    const senderMap = new Map();
    let pageToken   = null;
    let totalFetched = 0;

    do {
      const url = new URL(`${apiUri}/v3/grants/${grant_id}/messages`);
      url.searchParams.set('limit',  PAGE_SIZE);
      url.searchParams.set('fields', 'id,from,subject,date,unread');
      if (pageToken) url.searchParams.set('page_token', pageToken);

      const response = await fetch(url.toString(), { headers });
      const data     = await response.json();

      if (!response.ok) return res.status(response.status).json({ error: data.error || 'Failed to fetch messages' });

      for (const msg of data.data || []) {
        const from = msg.from?.[0];
        if (!from?.email) continue;

        const key = from.email.toLowerCase();
        if (!senderMap.has(key)) {
          senderMap.set(key, {
            email:       from.email,
            name:        from.name || from.email.split('@')[0],
            domain:      from.email.split('@')[1] || '',
            count:       0,
            latestDate:  0,
            latestMsgId: null,
          });
        }
        const entry = senderMap.get(key);
        entry.count += 1;
        if (msg.date > entry.latestDate) {
          entry.latestDate  = msg.date;
          entry.latestMsgId = msg.id;
        }
      }

      totalFetched += (data.data || []).length;
      // Nylas v3 puts the next cursor in next_cursor at the top level
      pageToken = data.next_cursor || null;

    } while (pageToken && totalFetched < MAX_EMAILS);

    // Only surface senders with 2+ emails (likely subscriptions, not one-offs)
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

function inferCategory(email, name) {
  const str = `${email} ${name}`.toLowerCase();
  if (/linkedin|twitter|facebook|instagram|social|notify/.test(str)) return 'Social';
  if (/deals|offer|promo|sale|discount|shop|amazon|ebay/.test(str))   return 'Promotions';
  if (/newsletter|digest|weekly|daily|substack|medium|nytimes/.test(str)) return 'Newsletter';
  return 'Marketing';
}

function inferFrequency(count) {
  if (count >= 60) return 'Daily';
  if (count >= 25) return '2x / week';
  if (count >= 12) return 'Weekly';
  if (count >= 4)  return 'Monthly';
  return 'Occasional';
}

const DOMAIN_COLORS = {
  'gmail.com': '#EA4335', 'outlook.com': '#0078D4', 'hotmail.com': '#0078D4',
  'yahoo.com': '#6001D2', 'spotify.com': '#1DB954', 'linkedin.com': '#0A66C2',
  'amazon.com': '#FF9900', 'substack.com': '#FF6719', 'medium.com': '#000000',
  'nytimes.com': '#000000', 'facebook.com': '#1877F2', 'twitter.com': '#1DA1F2',
};

function logoColor(domain) {
  if (DOMAIN_COLORS[domain]) return DOMAIN_COLORS[domain];
  let hash = 0;
  for (const ch of domain) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 40%)`;
}
