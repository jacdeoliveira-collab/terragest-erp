import { createClient } from '@supabase/supabase-js';

function getSupabaseCreds() {
  return {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  };
}

function getAsaasBaseUrl(environment) {
  return environment === 'sandbox'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/v3';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY } = getSupabaseCreds();
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
    let apiKey = clientApiKey || process.env.ASAAS_API_KEY || process.env.VITE_ASAAS_API_KEY;
    let environment = clientEnvironment || process.env.ASAAS_ENVIRONMENT || process.env.VITE_ASAAS_ENVIRONMENT || 'production';

    if (clientApiKey) {
      try {
        await supabase.rpc('salvar_asaas_master_checkout', { p_api_key: clientApiKey, p_environment: environment });
      } catch {}
    }

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
    const asaasHeaders = { 'Content-Type': 'application/json', access_token: apiKey, 'User-Agent': 'TerraGest-ERP/1.0' };

    if (action === 'verificar') {
      if (!paymentId || !assinaturaId) {
        return res.status(400).json({ error: 'paymentId e assinaturaId são obrigatórios' });
      }

      const payRes = await fetch(`${asaasUrl}/payments/${paymentId}`, {
        headers: asaasHeaders
      });
      const payData = await payRes.json();

      const isPaid = payData.status === 'RECEIVED' || payData.status === 'CONFIRMED';
      if (isPaid) {
        await supabase.rpc('confirmar_pagamento_saas', {
          p_assinatura_id: assinaturaId,
          p_asaas_payment_id: paymentId
        });

        const { plano: nvPlano, valorMensalRecorrente, limiteUsuarios, diasAcessoTotalNovo } = req.body || {};
        if (tenantId && nvPlano) {
          const fim = new Date();
          fim.setDate(fim.getDate() + (Number(diasAcessoTotalNovo) || 30));
          const { data: tRow } = await supabase.from('tenants').select('asaas_subscription_id').eq('id', tenantId).maybeSingle();
          if (tRow?.asaas_subscription_id && valorMensalRecorrente) {
            await fetch(`${asaasUrl}/subscriptions/${tRow.asaas_subscription_id}`, {
              method: 'PUT',
              headers: asaasHeaders,
              body: JSON.stringify({
                value: Number(valorMensalRecorrente),
                description: `Assinatura Mensal TerraGest ERP - Plano ${nvPlano}`,
                updatePendingPayments: false
              })
            });
          }
          await supabase.from('tenants').update({
            plano: nvPlano,
            plano_valor: Number(valorMensalRecorrente || valor || 0),
            valor_mensalidade: Number(valorMensalRecorrente || valor || 0),
            ...(limiteUsuarios ? { limite_usuarios: Number(limiteUsuarios) } : {}),
            assinatura_fim: fim.toISOString().slice(0, 10)
          }).eq('id', tenantId);
        }
      }

      return res.status(200).json({
        pago: isPaid,
        status: payData.status,
        payment: payData
      });
    }

    if (action === 'sincronizar_preco_plano') {
      const { codigoPlano, novoValor, novoLimiteUsuarios } = req.body || {};
      if (!codigoPlano) return res.status(400).json({ error: 'codigoPlano é obrigatório' });

      const { data: tenantsPlano } = await supabase
        .from('tenants')
        .select('id, asaas_subscription_id')
        .eq('plano', codigoPlano);

      let atualizadosAsaas = 0;
      for (const t of tenantsPlano || []) {
        await supabase.from('tenants').update({
          plano_valor: Number(novoValor || 0),
          valor_mensalidade: Number(novoValor || 0),
          ...(novoLimiteUsuarios ? { limite_usuarios: Number(novoLimiteUsuarios) } : {})
        }).eq('id', t.id);

        if (t.asaas_subscription_id && Number(novoValor) > 0) {
          const upRes = await fetch(`${asaasUrl}/subscriptions/${t.asaas_subscription_id}`, {
            method: 'PUT',
            headers: asaasHeaders,
            body: JSON.stringify({
              value: Number(novoValor),
              description: `Assinatura Mensal TerraGest ERP - Plano ${codigoPlano}`,
              updatePendingPayments: true
            })
          });
          if (upRes.ok) atualizadosAsaas++;
        }
      }

      return res.status(200).json({ success: true, tenantsAtualizados: (tenantsPlano || []).length, atualizadosAsaas });
    }

    if (action === 'trocar_plano_com_credito') {
      const { valorMensalRecorrente, limiteUsuarios, novaDataVencimento } = req.body || {};
      if (!tenantId || !plano || !novaDataVencimento) {
        return res.status(400).json({ error: 'tenantId, plano e novaDataVencimento são obrigatórios.' });
      }

      const { data: tRow } = await supabase
        .from('tenants')
        .select('id, asaas_subscription_id')
        .eq('id', tenantId)
        .maybeSingle();

      if (tRow?.asaas_subscription_id && Number(valorMensalRecorrente) > 0) {
        await fetch(`${asaasUrl}/subscriptions/${tRow.asaas_subscription_id}`, {
          method: 'PUT',
          headers: asaasHeaders,
          body: JSON.stringify({
            value: Number(valorMensalRecorrente),
            nextDueDate: novaDataVencimento,
            description: `Assinatura Mensal TerraGest ERP - Plano ${plano}`,
            updatePendingPayments: true
          })
        });
      }

      const { error: updErr } = await supabase.from('tenants').update({
        plano,
        plano_valor: Number(valorMensalRecorrente || 0),
        valor_mensalidade: Number(valorMensalRecorrente || 0),
        ...(limiteUsuarios ? { limite_usuarios: Number(limiteUsuarios) } : {}),
        assinatura_fim: novaDataVencimento,
        status_conta: 'ativo',
        updated_at: new Date().toISOString()
      }).eq('id', tenantId);

      if (updErr) throw new Error(updErr.message);

      return res.status(200).json({
        success: true,
        trocadoComCredito: true,
        plano,
        novaDataVencimento
      });
    }

    if (action === 'criar') {
      if (!plano || !valor || !tenantId) {
        return res.status(400).json({ error: 'plano, valor e tenantId são obrigatórios' });
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .maybeSingle();

      const cleanCpfCnpj = String(req.body?.cpfCnpj || tenant?.documento || tenant?.cnpj || tenant?.cpf_cnpj || '').replace(/\D/g, '');
      if (!cleanCpfCnpj) {
        return res.status(400).json({
          error: 'Informe o CPF ou CNPJ da empresa para gerar o QR Code PIX no Asaas.',
          needsCpfCnpj: true
        });
      }
      if (req.body?.cpfCnpj && tenant && !tenant.documento && !tenant.cnpj) {
        await supabase.from('tenants').update({ cnpj: cleanCpfCnpj }).eq('id', tenantId);
      }

      const custRes = await fetch(`${asaasUrl}/customers`, {
        method: 'POST',
        headers: asaasHeaders,
        body: JSON.stringify({
          name: tenant?.razao_social || tenant?.nome || 'Assinante TerraGest',
          cpfCnpj: cleanCpfCnpj,
          email: tenant?.contato_email || tenant?.email || undefined,
          phone: (tenant?.contato_telefone || tenant?.telefone) ? String(tenant?.contato_telefone || tenant?.telefone).replace(/\D/g, '') : undefined
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
        headers: asaasHeaders,
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
        headers: asaasHeaders
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

    if (action === 'criar_assinatura_recorrente') {
      const { cliente, billingType = 'PIX' } = req.body || {};
      if (!plano || !valor || !tenantId || !cliente?.cpfCnpj) {
        return res.status(400).json({ error: 'plano, valor, tenantId e CPF/CNPJ são obrigatórios' });
      }

      const cleanCpfCnpj = String(cliente.cpfCnpj).replace(/\D/g, '');
      const cleanPhone = String(cliente.telefone || '').replace(/\D/g, '');
      const cleanCep = String(cliente.cep || '').replace(/\D/g, '');

      const custRes = await fetch(`${asaasUrl}/customers`, {
        method: 'POST',
        headers: asaasHeaders,
        body: JSON.stringify({
          name: cliente.nome || 'Assinante TerraGest',
          cpfCnpj: cleanCpfCnpj,
          email: cliente.email || undefined,
          mobilePhone: cleanPhone || undefined,
          postalCode: cleanCep || undefined,
          address: cliente.endereco || undefined,
          addressNumber: cliente.numero || 'S/N',
          externalReference: tenantId
        })
      });
      const custData = await custRes.json();
      if (!custData.id) {
        throw new Error(`Erro Asaas (Cliente): ${custData.errors?.[0]?.description || 'Dados inválidos'}`);
      }

      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 3);
      const nextDueDate = nextDue.toISOString().split('T')[0];

      const subRes = await fetch(`${asaasUrl}/subscriptions`, {
        method: 'POST',
        headers: asaasHeaders,
        body: JSON.stringify({
          customer: custData.id,
          billingType,
          value: Number(valor),
          nextDueDate,
          cycle: 'MONTHLY',
          description: `Assinatura Mensal TerraGest ERP - Plano ${plano}`,
          externalReference: `tenant_${tenantId}`
        })
      });
      const subData = await subRes.json();
      if (!subData.id) {
        throw new Error(`Erro Asaas (Assinatura): ${subData.errors?.[0]?.description || 'Falha ao criar assinatura'}`);
      }

      let firstPayment = null;
      let pixData = null;
      const paysRes = await fetch(`${asaasUrl}/subscriptions/${subData.id}/payments?limit=1`, {
        headers: asaasHeaders
      });
      const paysJson = await paysRes.json();
      if (Array.isArray(paysJson?.data) && paysJson.data.length > 0) {
        firstPayment = paysJson.data[0];
        if (billingType === 'PIX' && firstPayment.id) {
          const qrRes = await fetch(`${asaasUrl}/payments/${firstPayment.id}/pixQrCode`, { headers: asaasHeaders });
          pixData = await qrRes.json();
        }
      }

      const { error: rpcVincErr } = await supabase.rpc('vincular_assinatura_asaas_tenant', {
        p_tenant_id: tenantId,
        p_plano: plano,
        p_valor: Number(valor),
        p_billing_type: billingType,
        p_customer_id: custData.id,
        p_subscription_id: subData.id,
        p_status: subData.status || 'ACTIVE',
        p_payment_id: firstPayment?.id || null,
        p_invoice_url: firstPayment?.invoiceUrl || null,
        p_pix_qr_code: pixData?.encodedImage || null,
        p_pix_copia_cola: pixData?.payload || null
      });

      if (rpcVincErr) {
        await supabase.from('tenants').update({
          plano, plano_valor: Number(valor), valor_mensalidade: Number(valor),
          asaas_customer_id: custData.id, asaas_subscription_id: subData.id,
          asaas_subscription_status: subData.status || 'ACTIVE'
        }).eq('id', tenantId);
      }

      return res.status(200).json({
        success: true,
        customerId: custData.id,
        subscriptionId: subData.id,
        status: subData.status || 'ACTIVE',
        paymentId: firstPayment?.id || null,
        invoiceUrl: firstPayment?.invoiceUrl || null,
        pixQrCode: pixData?.encodedImage || null,
        pixCopiaCola: pixData?.payload || null
      });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno checkout SaaS' });
  }
}

