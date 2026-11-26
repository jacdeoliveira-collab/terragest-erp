-- ==============================================================================
-- TerraGest ERP - Migração 65: Tabela dinâmica de Planos SaaS, Matriz de
-- Módulos (Feature Gating real) e colunas de Assinatura Recorrente Asaas
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.saas_planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(40) UNIQUE NOT NULL,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  valor_mensal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  limite_usuarios INT NOT NULL DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  ordem INT NOT NULL DEFAULT 0,
  modulos_habilitados JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saas_planos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saas_planos_public_select" ON public.saas_planos;
CREATE POLICY "saas_planos_public_select" ON public.saas_planos
  FOR SELECT TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "saas_planos_master_write" ON public.saas_planos;
CREATE POLICY "saas_planos_master_write" ON public.saas_planos
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
        AND (tu.role IN ('admin', 'master', 'superadmin') OR tu.perfil_acesso = 'ADMIN')
    )
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
        AND (tu.role IN ('admin', 'master', 'superadmin') OR tu.perfil_acesso = 'ADMIN')
    )
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
  );

-- Garantir colunas de assinatura recorrente Asaas em tenants e saas_assinaturas
ALTER TABLE public.tenants DROP CONSTRAINT IF EXISTS tenants_plano_check;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS asaas_subscription_status VARCHAR(40);

ALTER TABLE public.saas_assinaturas ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
ALTER TABLE public.saas_assinaturas ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;
ALTER TABLE public.saas_assinaturas ADD COLUMN IF NOT EXISTS billing_type VARCHAR(30) DEFAULT 'PIX';

CREATE OR REPLACE FUNCTION public.salvar_asaas_master_checkout(
  p_api_key TEXT,
  p_environment TEXT DEFAULT 'production'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_master_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  v_cfg JSONB;
BEGIN
  SELECT id INTO v_master_id FROM public.tenants ORDER BY created_at ASC LIMIT 1;
  v_cfg := jsonb_build_object(
    'provider', 'ASAAS',
    'apiKey', trim(p_api_key),
    'environment', COALESCE(p_environment, 'production'),
    'connectedAt', NOW()
  );

  INSERT INTO public.tenant_integrations (tenant_id, provider, status, metadata, updated_at)
  VALUES (v_master_id, 'google_drive', 'connected', jsonb_build_object('asaas_config', v_cfg), NOW())
  ON CONFLICT (tenant_id, provider)
  DO UPDATE SET
    metadata = COALESCE(public.tenant_integrations.metadata, '{}'::jsonb) || jsonb_build_object('asaas_config', v_cfg),
    updated_at = NOW();

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.salvar_asaas_master_checkout(TEXT, TEXT) TO authenticated, anon;

-- Planos iniciais reais (editáveis pelo Painel Master)
INSERT INTO public.saas_planos (codigo, nome, descricao, valor_mensal, limite_usuarios, ativo, destaque, ordem, modulos_habilitados)
VALUES
  (
    'BASICO',
    'Plano Básico',
    'Ideal para pequenas locadoras: Serviços por Horímetro, Agenda, Clientes, Maquinário, Boletim e Checklist.',
    299.00, 3, TRUE, FALSE, 1,
    '["/", "/comercial", "/agenda", "/clientes", "/frota", "/bde", "/checklist", "/centros-custo"]'::jsonb
  ),
  (
    'INTERMEDIARIO',
    'Plano Intermediário',
    'Operação de campo completa: inclui Controle de Combustível/Melosa, RH & Operadores e Manutenção Preventiva.',
    599.00, 10, TRUE, TRUE, 2,
    '["/", "/comercial", "/agenda", "/clientes", "/frota", "/bde", "/checklist", "/centros-custo", "/abastecimento", "/rh", "/manutencao"]'::jsonb
  ),
  (
    'COMPLETO',
    'Plano Completo',
    'Gestão total sem limites: Financeiro completo, Almoxarifado, Sinaleira & Produção, Asaas e Google Drive.',
    990.00, 50, TRUE, FALSE, 3,
    '["/", "/comercial", "/agenda", "/clientes", "/frota", "/bde", "/producao", "/almoxarifado", "/financeiro", "/rh", "/abastecimento", "/manutencao", "/checklist", "/centros-custo"]'::jsonb
  )
ON CONFLICT (codigo) DO NOTHING;
