export function inferCategory(email, name) {
  const str = `${email} ${name}`.toLowerCase();
  if (/linkedin|twitter|facebook|instagram|social|notify/.test(str)) return 'Social';
  if (/deals|offer|promo|sale|discount|shop|amazon|ebay/.test(str)) return 'Promotions';
  if (/newsletter|digest|weekly|daily|substack|medium|nytimes/.test(str)) return 'Newsletter';
  return 'Marketing';
}

export function inferFrequency(count) {
  if (count >= 60) return 'Daily';
  if (count >= 25) return '2x / week';
  if (count >= 12) return 'Weekly';
  if (count >= 4) return 'Monthly';
  return 'Occasional';
}

const DOMAIN_COLORS = {
  'gmail.com': '#EA4335', 'outlook.com': '#0078D4', 'hotmail.com': '#0078D4',
  'yahoo.com': '#6001D2', 'spotify.com': '#1DB954', 'linkedin.com': '#0A66C2',
  'amazon.com': '#FF9900', 'substack.com': '#FF6719', 'medium.com': '#000000',
};

export function logoColor(domain) {
  if (DOMAIN_COLORS[domain]) return DOMAIN_COLORS[domain];
  let hash = 0;
  for (const ch of domain) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 40%)`;
}
