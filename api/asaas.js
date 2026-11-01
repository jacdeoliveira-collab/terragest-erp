export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-asaas-key, x-asaas-env');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = req.headers['x-asaas-key'] || req.body?.apiKey;
    const environment = req.headers['x-asaas-env'] || req.body?.environment || 'production';
    const endpoint = req.query?.endpoint || req.body?.endpoint;
    const method = req.body?.method || req.method || 'GET';
    const payload = req.body?.payload;

    if (!apiKey) {
      return res.status(400).json({ error: 'Chave de API do Asaas não informada.' });
    }
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint da API Asaas não especificado.' });
    }

    const baseUrl = environment === 'sandbox'
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3';

    const cleanEndpoint = String(endpoint).startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${baseUrl}${cleanEndpoint}`;

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'access_token': String(apiKey).trim(),
        'User-Agent': 'TerraGest-ERP/1.0'
      }
    };

    if (payload && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Erro interno ao comunicar com o Asaas'
    });
  }
}

