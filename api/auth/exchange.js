// Exchanges the OAuth code for a Nylas grant_id
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const clientId   = process.env.NYLAS_CLIENT_ID;
  const apiKey     = process.env.NYLAS_API_KEY;
  const apiUri     = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const redirectUri = process.env.NYLAS_REDIRECT_URI || `${process.env.VITE_APP_URL}/callback`;

  try {
    const response = await fetch(`${apiUri}/v3/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: apiKey,
        redirect_uri:  redirectUri,
        code,
        grant_type:    'authorization_code',
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error || 'Token exchange failed' });

    // Return only what the frontend needs — never expose the full token
    res.status(200).json({
      grant_id: data.grant_id,
      email:    data.email,
      provider: data.provider,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
