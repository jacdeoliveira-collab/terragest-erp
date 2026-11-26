import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, asaas-access-token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'TerraGest ERP Asaas Webhook Receiver v4 (Recorrente + RLS)',
      webhookUrl: 'https://terragest.agrodronesma.com.br/api/asaas-webhook'
    });
  }

  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (expectedToken) {
      const receivedToken = req.headers['asaas-access-token'] || '';
      if (receivedToken !== expectedToken) {
        return res.status(401).json({ error: 'Token de webhook Asaas inválido.' });
      }
    }

    const body = req.body || {};
    const event = body.event || body.action || body.type || '';
    const payment = body.payment || body.data || {};
    const subscription = body.subscription || {};

    if (!event && !payment?.id && !subscription?.id) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const extRef = payment?.externalReference || subscription?.externalReference || body?.externalReference || '';
    const subId = payment?.subscription || subscription?.id || null;
    const dataPgto = payment?.paymentDate || payment?.clientPaymentDate || new Date().toISOString().slice(0, 10);
    const forma = payment?.billingType === 'PIX' || body?.type === 'pix' ? 'PIX' : 'BOLETO';

    const { data, error } = await supabase.rpc('processar_webhook_asaas', {
      p_event: String(event),
      p_external_ref: String(extRef || ''),
      p_subscription_id: subId ? String(subId) : null,
      p_payment_id: payment?.id ? String(payment.id) : null,
      p_data_pagamento: String(dataPgto).slice(0, 10),
      p_forma: forma
    });

    if (error) {
      return res.status(200).json({ received: true, event, warning: error.message });
    }

    return res.status(200).json({ received: true, event, result: data });
  } catch (err) {
    return res.status(200).json({
      received: true,
      warning: err instanceof Error ? err.message : 'Processed with warning'
    });
  }
}
