import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

function getAsaasBaseUrl(environment) {
  return environment === 'sandbox'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: authHeader ? { Authorization: authHeader } : {} }
  });

  const { action, plano, valor, tenantId, assinaturaId, paymentId, clientApiKey, clientEnvironment } = req.body || {};

  try {
    let apiKey = clientApiKey;
    let environment = clientEnvironment || 'production';

    if (!apiKey) {
      const { data: configRows } = await supabase.rpc('obter_asaas_master_checkout');
      const masterConfig = Array.isArray(configRows) ? configRows[0] : configRows;
      apiKey = masterConfig?.apiKey;
      environment = masterConfig?.environment || environment;
    }

    if (!apiKey) {
      const { data: tiRows } = await supabase
        .from('tenant_integrations')
        .select('metadata')
        .order('created_at', { ascending: true })
        .limit(10);
      for (const r of tiRows || []) {
        const meta = r.metadata || {};
        if (meta?.asaas_config?.apiKey) {
          apiKey = meta.asaas_config.apiKey;
          environment = meta.asaas_config.environment || environment;
          break;
        }
      }
    }

    if (!apiKey) {
      throw new Error('Conta Asaas Master não configurada para receber assinaturas.');
    }

    const asaasUrl = getAsaasBaseUrl(environment);

    if (action === 'verificar') {
      if (!paymentId || !assinaturaId) {
        return res.status(400).json({ error: 'paymentId e assinaturaId são obrigatórios' });
      }

      const payRes = await fetch(`${asaasUrl}/payments/${paymentId}`, {
        headers: { access_token: apiKey }
      });
      const payData = await payRes.json();

      const isPaid = payData.status === 'RECEIVED' || payData.status === 'CONFIRMED';
      if (isPaid) {
        await supabase.rpc('confirmar_pagamento_saas', {
          p_assinatura_id: assinaturaId,
          p_asaas_payment_id: paymentId
        });
      }

      return res.status(200).json({
        pago: isPaid,
        status: payData.status,
        payment: payData
      });
    }

    if (action === 'criar') {
      if (!plano || !valor || !tenantId) {
        return res.status(400).json({ error: 'plano, valor e tenantId são obrigatórios' });
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, nome, documento, contato_email, contato_telefone')
        .eq('id', tenantId)
        .maybeSingle();

      const cleanCpfCnpj = (tenant?.documento || '').replace(/\D/g, '');
      const custRes = await fetch(`${asaasUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: apiKey },
        body: JSON.stringify({
          name: tenant?.nome || 'Assinante TerraGest',
          cpfCnpj: cleanCpfCnpj || undefined,
          email: tenant?.contato_email || undefined,
          phone: tenant?.contato_telefone ? tenant.contato_telefone.replace(/\D/g, '') : undefined
        })
      });
      const custData = await custRes.json();
      const customerId = custData.id;
      if (!customerId) {
        throw new Error(`Erro ao registrar cliente Asaas: ${custData.errors?.[0]?.description || 'Erro'}`);
      }

      const { data: subData, error: subError } = await supabase
        .from('saas_assinaturas')
        .insert([{
          tenant_id: tenantId,
          plano,
          valor,
          billing_type: 'PIX',
          status: 'PENDENTE'
        }])
        .select()
        .single();

      if (subError) throw subError;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const payRes = await fetch(`${asaasUrl}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: apiKey },
        body: JSON.stringify({
          customer: customerId,
          billingType: 'PIX',
          value: valor,
          dueDate: dueDateStr,
          description: `Assinatura TerraGest ERP - Plano ${plano}`,
          externalReference: `saas_${subData.id}`
        })
      });
      const payData = await payRes.json();
      if (!payData.id) {
        throw new Error(`Erro ao gerar cobrança Asaas: ${payData.errors?.[0]?.description || 'Erro'}`);
      }

      const qrRes = await fetch(`${asaasUrl}/payments/${payData.id}/pixQrCode`, {
        headers: { access_token: apiKey }
      });
      const qrData = await qrRes.json();

      await supabase
        .from('saas_assinaturas')
        .update({
          asaas_payment_id: payData.id,
          pix_qr_code: qrData.encodedImage || null,
          pix_copia_cola: qrData.payload || null,
          invoice_url: payData.invoiceUrl || null
        })
        .eq('id', subData.id);

      return res.status(200).json({
        success: true,
        assinaturaId: subData.id,
        paymentId: payData.id,
        pixQrCode: qrData.encodedImage,
        pixCopiaCola: qrData.payload,
        invoiceUrl: payData.invoiceUrl,
        valor
      });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno checkout SaaS' });
  }
}

