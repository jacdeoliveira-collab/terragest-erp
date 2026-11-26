-- ==============================================================================
-- TerraGest ERP - Migração 70: Conciliação Segura de Webhook Asaas (Recorrência)
-- SECURITY DEFINER para operar com RLS estrita: renova +30d em pagamento
-- confirmado, bloqueia automaticamente em PAYMENT_OVERDUE e baixa faturas.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.processar_webhook_asaas(
  p_event TEXT,
  p_external_ref TEXT DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL,
  p_payment_id TEXT DEFAULT NULL,
  p_data_pagamento DATE DEFAULT CURRENT_DATE,
  p_forma TEXT DEFAULT 'PIX'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event TEXT := upper(COALESCE(p_event, ''));
  v_ext TEXT := COALESCE(trim(p_external_ref), '');
  v_tenant_id UUID;
  v_clean_id TEXT;
BEGIN
  -- 1. Tenta localizar tenant por externalReference (tenant_<uuid>) ou asaas_subscription_id
  IF v_ext LIKE 'tenant_%' THEN
    BEGIN
      v_tenant_id := replace(v_ext, 'tenant_', '')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_tenant_id := NULL;
    END;
  END IF;

  IF v_tenant_id IS NULL AND NULLIF(trim(COALESCE(p_subscription_id, '')), '') IS NOT NULL THEN
    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE asaas_subscription_id = trim(p_subscription_id)
    LIMIT 1;
  END IF;

  -- 2. Eventos de assinatura recorrente SaaS do tenant
  IF v_tenant_id IS NOT NULL THEN
    IF v_event IN ('PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT.UPDATED', 'INVOICE.PAID') THEN
      UPDATE public.tenants
      SET status_conta = 'ativo',
          asaas_subscription_status = 'ACTIVE',
          assinatura_inicio = COALESCE(assinatura_inicio, p_data_pagamento),
          assinatura_fim = (GREATEST(COALESCE(assinatura_fim, CURRENT_DATE), CURRENT_DATE) + INTERVAL '30 days')::date,
          updated_at = NOW()
      WHERE id = v_tenant_id;

      RETURN jsonb_build_object('ok', true, 'scope', 'tenant_renovado', 'tenant_id', v_tenant_id);
    END IF;

    IF v_event IN ('PAYMENT_OVERDUE', 'SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVATED') THEN
      UPDATE public.tenants
      SET status_conta = 'bloqueado',
          asaas_subscription_status = v_event,
          updated_at = NOW()
      WHERE id = v_tenant_id;

      RETURN jsonb_build_object('ok', true, 'scope', 'tenant_bloqueado_inadimplencia', 'tenant_id', v_tenant_id);
    END IF;
  END IF;

  -- 3. Referência direta de assinatura SaaS (saas_<id>)
  IF v_ext LIKE 'saas_%' AND v_event IN ('PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED') THEN
    PERFORM public.confirmar_pagamento_saas(
      replace(v_ext, 'saas_', '')::uuid,
      p_payment_id
    );
    RETURN jsonb_build_object('ok', true, 'scope', 'saas_assinatura_confirmada');
  END IF;

  -- 4. Cobranças operacionais de clientes (medições e serviços por horímetro)
  IF v_ext <> '' AND v_event IN ('PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT.UPDATED', 'INVOICE.PAID') THEN
    v_clean_id := split_part(replace(v_ext, 'serv_', ''), '_p', 1);

    UPDATE public.medicoes
    SET status_pagamento = 'PAGO',
        data_pagamento = p_data_pagamento,
        forma_pagamento = p_forma,
        updated_at = NOW()
    WHERE id::text = v_clean_id
       OR observacoes ILIKE '%[REF:' || v_clean_id || ']%';

    UPDATE public.servicos_horimetro
    SET status_pagamento_cliente = 'QUITADO',
        saldo_restante = 0,
        updated_at = NOW()
    WHERE id::text = v_clean_id;

    RETURN jsonb_build_object('ok', true, 'scope', 'cobranca_cliente_quitada', 'ref', v_clean_id);
  END IF;

  RETURN jsonb_build_object('ok', true, 'scope', 'ignorado', 'event', v_event);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.processar_webhook_asaas(TEXT, TEXT, TEXT, TEXT, DATE, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
