// Returns the Nylas hosted OAuth URL for the frontend to redirect to
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId   = process.env.NYLAS_CLIENT_ID;
  const apiUri     = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const redirectUri = process.env.NYLAS_REDIRECT_URI || `${process.env.VITE_APP_URL}/callback`;

  if (!clientId) return res.status(500).json({ error: 'NYLAS_CLIENT_ID not set' });

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    access_type:   'online',
  });

  const authUrl = `${apiUri}/v3/connect/auth?${params.toString()}`;
  res.status(200).json({ url: authUrl });
}
