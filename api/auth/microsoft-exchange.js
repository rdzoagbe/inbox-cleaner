export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const clientId     = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri  = process.env.MICROSOFT_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret) return res.status(500).json({ error: 'Microsoft OAuth not configured' });

  try {
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
        scope:         'offline_access User.Read Mail.Read Mail.Send',
      }).toString(),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) return res.status(400).json({ error: tokens.error_description || tokens.error });

    const meRes = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const me = await meRes.json();
    const email = (me.mail || me.userPrincipalName || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Could not read account email' });

    res.status(200).json({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      email,
      provider:      'microsoft',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
