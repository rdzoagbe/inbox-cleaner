export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId    = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Outlook sign-in is not configured yet. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.' });
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    response_type: 'code',
    redirect_uri:  redirectUri,
    response_mode: 'query',
    scope:         'offline_access User.Read Mail.Read Mail.Send',
    prompt:        'select_account',
    state:         'microsoft',
  });

  res.status(200).json({ url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}` });
}
