export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { refresh_token } = req.body || {};
  if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token,
        client_id:     clientId,
        client_secret: clientSecret,
        grant_type:    'refresh_token',
      }).toString(),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) return res.status(400).json({ error: tokens.error_description || tokens.error });

    res.status(200).json({ access_token: tokens.access_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
