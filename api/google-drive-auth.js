import { createClient } from '@supabase/supabase-js';

function getEnv() {
  return {
    supabaseUrl: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim(),
    supabaseKey: (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim(),
    clientId: (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim(),
    clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim()
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { supabaseUrl, supabaseKey, clientId, clientSecret } = getEnv();
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Credenciais Supabase não configuradas no servidor.' });
  }
  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'GOOGLE_CLIENT_SECRET não configurado no Vercel. Adicione a variável GOOGLE_CLIENT_SECRET nas configurações do projeto no Vercel.'
    });
  }

  const authHeader = req.headers.authorization || '';
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { headers: authHeader ? { Authorization: authHeader } : {} }
  });

  const { action, code, redirectUri, tenantId } = req.body || {};

  try {
    if (action === 'exchange') {
      if (!code || !redirectUri || !tenantId) {
        return res.status(400).json({ error: 'code, redirectUri e tenantId são obrigatórios.' });
      }

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        }).toString()
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Falha ao trocar código OAuth com o Google.');
      }

      let accountEmail = null;
      try {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        if (userRes.ok) {
          const userInfo = await userRes.json();
          accountEmail = userInfo.email || null;
        }
      } catch {}

      const expiresAt = new Date(Date.now() + (Number(tokenData.expires_in) || 3600) * 1000).toISOString();

      const { data: existing } = await supabase
        .from('tenant_integrations')
        .select('id, refresh_token, metadata')
        .eq('tenant_id', tenantId)
        .eq('provider', 'GOOGLE_DRIVE')
        .maybeSingle();

      const refreshFinal = tokenData.refresh_token || existing?.refresh_token || null;
      const payload = {
        tenant_id: tenantId,
        provider: 'GOOGLE_DRIVE',
        account_email: accountEmail,
        access_token: tokenData.access_token,
        refresh_token: refreshFinal,
        token_expires_at: expiresAt,
        status: 'connected',
        metadata: {
          ...(existing?.metadata || {}),
          connected_at: new Date().toISOString(),
          permanent_oauth: Boolean(refreshFinal)
        },
        updated_at: new Date().toISOString()
      };

      const saveRes = existing?.id
        ? await supabase.from('tenant_integrations').update(payload).eq('id', existing.id)
        : await supabase.from('tenant_integrations').insert([payload]);

      if (saveRes.error) throw new Error(saveRes.error.message);

      return res.status(200).json({
        success: true,
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in || 3600,
        account_email: accountEmail,
        has_refresh_token: Boolean(refreshFinal)
      });
    }

    if (action === 'refresh') {
      if (!tenantId) return res.status(400).json({ error: 'tenantId é obrigatório.' });

      const { data: integ } = await supabase
        .from('tenant_integrations')
        .select('id, access_token, refresh_token, token_expires_at')
        .eq('tenant_id', tenantId)
        .in('provider', ['GOOGLE_DRIVE', 'google_drive'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!integ?.refresh_token) {
        return res.status(401).json({
          error: 'Google Drive ainda não possui renovação automática ativa. Acesse Minha Empresa > Bancos e Drive e clique em "Conectar / Trocar Conta" uma vez.'
        });
      }

      // Se o access_token salvo ainda tem mais de 5 minutos de validade, reutiliza direto
      if (integ.access_token && integ.token_expires_at) {
        const msLeft = new Date(integ.token_expires_at).getTime() - Date.now();
        if (msLeft > 5 * 60 * 1000) {
          return res.status(200).json({
            success: true,
            access_token: integ.access_token,
            expires_in: Math.floor(msLeft / 1000)
          });
        }
      }

      const refRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: integ.refresh_token,
          grant_type: 'refresh_token'
        }).toString()
      });

      const refData = await refRes.json();
      if (!refRes.ok || !refData.access_token) {
        throw new Error(refData.error_description || refData.error || 'Falha ao renovar token do Google Drive.');
      }

      const newExpiresAt = new Date(Date.now() + (Number(refData.expires_in) || 3600) * 1000).toISOString();
      await supabase
        .from('tenant_integrations')
        .update({
          access_token: refData.access_token,
          token_expires_at: newExpiresAt,
          status: 'connected',
          updated_at: new Date().toISOString()
        })
        .eq('id', integ.id);

      return res.status(200).json({
        success: true,
        access_token: refData.access_token,
        expires_in: refData.expires_in || 3600
      });
    }

    return res.status(400).json({ error: 'Ação inválida.' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno na autenticação Google Drive.' });
  }
}
