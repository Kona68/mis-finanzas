const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Kona68';
const REPO  = 'mis-finanzas';
const FILE  = 'data.json';
const API   = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // No cachear nunca
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const ghRes = await fetch(API, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!ghRes.ok) {
      const err = await ghRes.json();
      return res.status(500).json({ error: err.message });
    }

    const file = await ghRes.json();
    const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));

    return res.status(200).json(content);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
