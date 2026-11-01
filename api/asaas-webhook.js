import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, asaas-access-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'TerraGest ERP Asaas Webhook Receiver v3',
      webhookUrl: 'https://terragest.agrodronesma.com.br/api/asaas-webhook'
    });
  }

  try {
    const body = req.body || {};
    const event = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED')) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const extRef = payment.externalReference || '';
      const dataPgto = payment.paymentDate || payment.clientPaymentDate || new Date().toISOString().slice(0, 10);
      const forma = payment.billingType === 'PIX' ? 'PIX' : 'BOLETO';

      if (extRef) {
        const cleanId = String(extRef).replace(/^serv_/, '').split('_p')[0];

        await supabase
          .from('medicoes')
          .update({
            status_pagamento: 'PAGO',
            data_pagamento: dataPgto,
            forma_pagamento: forma,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${cleanId},observacoes.ilike.%[REF:${cleanId}]%`);

        await supabase
          .from('servicos_horimetro')
          .update({
            status_pagamento_cliente: 'QUITADO',
            saldo_restante: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', cleanId);
      }
    }

    return res.status(200).json({ received: true, event });
  } catch (err) {
    return res.status(200).json({
      received: true,
      warning: err instanceof Error ? err.message : 'Processed with warning'
    });
  }
}
