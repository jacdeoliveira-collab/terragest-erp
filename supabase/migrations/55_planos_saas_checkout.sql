-- ==============================================================================
-- TerraGest ERP - Migração 55: Planos Freemium & Checkout SaaS (Asaas Master)
-- ==============================================================================

-- 1. Tabela de cobranças/assinaturas SaaS das empresas clientes
CREATE TABLE IF NOT EXISTS public.saas_assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  plano VARCHAR(30) NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDENTE',
  asaas_payment_id VARCHAR(100),
  pix_qr_code TEXT,
  pix_copia_cola TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saas_assinaturas_tenant ON public.saas_assinaturas(tenant_id, created_at DESC);

ALTER TABLE public.saas_assinaturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saas_assinaturas_tenant_policy" ON public.saas_assinaturas;
CREATE POLICY "saas_assinaturas_tenant_policy" ON public.saas_assinaturas
  FOR ALL TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.saas_assinaturas.tenant_id
        AND tu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.saas_assinaturas.tenant_id
        AND tu.user_id = auth.uid()
    )
  );

-- 2. RPC segura para o endpoint /api/saas-checkout ler a chave Asaas do Tenant Master
CREATE OR REPLACE FUNCTION public.obter_asaas_master_checkout()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg JSONB;
BEGIN
  SELECT (ti.metadata->'asaas_config') INTO cfg
  FROM public.tenant_integrations ti
  WHERE ti.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    AND ti.metadata->'asaas_config'->>'apiKey' IS NOT NULL
    AND (ti.metadata->'asaas_config'->>'apiKey') <> ''
  ORDER BY ti.updated_at DESC
  LIMIT 1;

  IF cfg IS NULL THEN
    SELECT (ti.metadata->'asaas_config') INTO cfg
    FROM public.tenant_integrations ti
    WHERE ti.metadata->'asaas_config'->>'apiKey' IS NOT NULL
      AND (ti.metadata->'asaas_config'->>'apiKey') <> ''
    ORDER BY ti.created_at ASC
    LIMIT 1;
  END IF;

  RETURN COALESCE(cfg, '{}'::jsonb);
END;
$$;

-- 3. RPC para confirmar pagamento SaaS (chamada pelo Webhook ou Verificação) e liberar o plano
CREATE OR REPLACE FUNCTION public.confirmar_pagamento_saas(
  p_assinatura_id UUID,
  p_asaas_payment_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.saas_assinaturas%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.saas_assinaturas WHERE id = p_assinatura_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Assinatura não encontrada');
  END IF;

  UPDATE public.saas_assinaturas
  SET status = 'PAGO',
      asaas_payment_id = COALESCE(p_asaas_payment_id, asaas_payment_id),
      updated_at = NOW()
  WHERE id = p_assinatura_id;

  UPDATE public.tenants
  SET plano = v_row.plano,
      plano_valor = v_row.valor,
      valor_mensalidade = v_row.valor,
      status_conta = 'ativo',
      assinatura_inicio = CURRENT_DATE,
      assinatura_fim = (CURRENT_DATE + INTERVAL '30 days')::date,
      updated_at = NOW()
  WHERE id = v_row.tenant_id;

  RETURN jsonb_build_object('success', true, 'tenant_id', v_row.tenant_id, 'plano', v_row.plano);
END;
$$;

GRANT EXECUTE ON FUNCTION public.obter_asaas_master_checkout() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.confirmar_pagamento_saas(UUID, TEXT) TO authenticated, anon;

