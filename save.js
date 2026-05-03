const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Kona68';
const REPO  = 'mis-finanzas';
const FILE  = 'data.json';
const API   = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { entradas, cuotas, tarjetas } = req.body;

    // 1. Obtener SHA actual del archivo
    const getRes = await fetch(API, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    let sha = null;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 2. Encodear contenido en base64
    const content = Buffer.from(JSON.stringify({ entradas, cuotas, tarjetas }, null, 2)).toString('base64');

    // 3. Hacer commit
    const body = { message: 'sync: actualización de datos', content };
    if (sha) body.sha = sha;

    const putRes = await fetch(API, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: err.message });
    }

    const result = await putRes.json();
    return res.status(200).json({ sha: result.content.sha });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
