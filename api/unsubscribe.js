// Executes a real unsubscribe for a sender:
// 1. Fetches the latest message from that sender to find the List-Unsubscribe header
// 2. If it contains an https: URL → makes a server-side GET request to it
// 3. If it contains a mailto: address → sends an unsubscribe email via Nylas
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { grant_id, message_id, sender_email } = req.body;
  if (!grant_id || !message_id) return res.status(400).json({ error: 'Missing grant_id or message_id' });

  const apiKey = process.env.NYLAS_API_KEY;
  const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  try {
    // 1. Fetch the full message to get headers
    const msgRes  = await fetch(`${apiUri}/v3/grants/${grant_id}/messages/${message_id}`, { headers });
    const msgData = await msgRes.json();

    if (!msgRes.ok) return res.status(msgRes.status).json({ error: 'Could not fetch message' });

    // 2. Find List-Unsubscribe header (case-insensitive)
    const msgHeaders   = msgData.headers || msgData.data?.headers || [];
    const unsubHeader  = msgHeaders.find(h => h.name?.toLowerCase() === 'list-unsubscribe');
    const headerValue  = unsubHeader?.value || '';

    // Parse mailto and https from the header value
    // Format: "<mailto:unsub@example.com?subject=unsub>, <https://example.com/unsub>"
    const httpsMatch  = headerValue.match(/<(https?:\/\/[^>]+)>/i);
    const mailtoMatch = headerValue.match(/<mailto:([^>?]+)(?:\?([^>]*))?>/i);

    if (httpsMatch) {
      // Option A: HTTP one-click unsubscribe (RFC 8058)
      try {
        const unsubRes = await fetch(httpsMatch[1], {
          method:  'POST',           // RFC 8058 requires POST for one-click
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    'List-Unsubscribe=One-Click',
          redirect: 'follow',
          signal:  AbortSignal.timeout(8000),
        });
        return res.status(200).json({ method: 'http', success: unsubRes.ok || unsubRes.status < 400, url: httpsMatch[1] });
      } catch {
        // Fall through to mailto if HTTP fails
      }
    }

    if (mailtoMatch) {
      // Option B: Send unsubscribe email via Nylas
      const toEmail   = mailtoMatch[1];
      const rawParams = mailtoMatch[2] || '';
      const params    = Object.fromEntries(rawParams.split('&').filter(Boolean).map(p => p.split('=')));
      const subject   = decodeURIComponent(params.subject || 'Unsubscribe');

      const sendRes = await fetch(`${apiUri}/v3/grants/${grant_id}/messages/send`, {
        method:  'POST',
        headers,
        body: JSON.stringify({
          subject,
          to:   [{ email: toEmail }],
          body: '',
        }),
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) return res.status(sendRes.status).json({ error: sendData.error || 'Failed to send unsubscribe email' });
      return res.status(200).json({ method: 'mailto', success: true, to: toEmail });
    }

    // No List-Unsubscribe header found — UI should still remove the row
    return res.status(200).json({ method: 'none', success: false, message: 'No List-Unsubscribe header found' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
