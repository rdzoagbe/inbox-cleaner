export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { access_token, message_id } = req.body || {};
  if (!access_token || !message_id) return res.status(400).json({ error: 'Missing access_token or message_id' });

  try {
    const msgRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(message_id)}?$select=internetMessageHeaders`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const msgData = await msgRes.json();
    if (!msgRes.ok) return res.status(msgRes.status).json({ error: msgData.error?.message || 'Could not fetch message' });

    const headerValue = (msgData.internetMessageHeaders || []).find(h => h.name.toLowerCase() === 'list-unsubscribe')?.value || '';
    const httpsMatch  = headerValue.match(/<(https?:\/\/[^>]+)>/i);
    const mailtoMatch = headerValue.match(/<mailto:([^>?]+)(?:\?([^>]*))?>/i);

    if (httpsMatch) {
      try {
        const unsubRes = await fetch(httpsMatch[1], {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    'List-Unsubscribe=One-Click',
          redirect: 'follow',
          signal:  AbortSignal.timeout(8000),
        });
        return res.status(200).json({ method: 'http', success: unsubRes.ok || unsubRes.status < 400, url: httpsMatch[1] });
      } catch {
        // fall through to mailto
      }
    }

    if (mailtoMatch) {
      const toEmail   = mailtoMatch[1];
      const rawParams = mailtoMatch[2] || '';
      const params    = Object.fromEntries(rawParams.split('&').filter(Boolean).map(p => p.split('=')));
      const subject   = decodeURIComponent(params.subject || 'Unsubscribe');

      const sendRes = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: 'Text', content: 'Unsubscribe' },
            toRecipients: [{ emailAddress: { address: toEmail } }],
          },
          saveToSentItems: false,
        }),
      });
      if (!sendRes.ok) {
        const sendData = await sendRes.json().catch(() => ({}));
        return res.status(sendRes.status).json({ error: sendData.error?.message || 'Failed to send unsubscribe email' });
      }
      return res.status(200).json({ method: 'mailto', success: true, to: toEmail });
    }

    return res.status(200).json({ method: 'none', success: false, message: 'No List-Unsubscribe header found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
