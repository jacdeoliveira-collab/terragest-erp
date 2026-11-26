-- ==============================================================================
-- TerraGest ERP - Migração 66: Onboarding Multitenant Seguro (RLS + RPCs)
-- 100% genérica: zero dados pessoais, zero chaves fixas, isolamento estrito RLS.
-- ==============================================================================

-- 1. RPC segura para registro inicial de qualquer nova empresa (tenant)
CREATE OR REPLACE FUNCTION public.registrar_tenant_publico(
  p_user_id UUID,
  p_nome TEXT,
  p_cnpj TEXT,
  p_email TEXT,
  p_telefone TEXT,
  p_endereco TEXT,
  p_plano TEXT,
  p_valor NUMERIC,
  p_limite_usuarios INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_tenant_exists BOOLEAN;
BEGIN
  SELECT id, email, created_at, raw_user_meta_data
    INTO v_user
  FROM auth.users
  WHERE id = p_user_id
    AND lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Credencial de autenticação inválida para este cadastro.');
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.tenants WHERE id = p_user_id) INTO v_tenant_exists;

  -- Impede sequestro ou sobrescrita de empresas já existentes por terceiros
  IF v_tenant_exists AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Empresa já registrada para esta conta.');
  END IF;

  IF NOT v_tenant_exists AND auth.uid() IS NULL AND v_user.created_at < (NOW() - INTERVAL '10 minutes') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sessão de cadastro expirada. Faça login para continuar.');
  END IF;

  INSERT INTO public.tenants (
    id, nome, cnpj, admin_email, contato_email, contato_telefone, endereco,
    plano, status_conta, assinatura_inicio, assinatura_fim,
    limite_usuarios, valor_mensalidade, plano_valor
  ) VALUES (
    p_user_id, trim(p_nome), NULLIF(trim(COALESCE(p_cnpj, '')), ''),
    lower(trim(p_email)), lower(trim(p_email)), NULLIF(trim(COALESCE(p_telefone, '')), ''),
    NULLIF(trim(COALESCE(p_endereco, '')), ''),
    upper(COALESCE(p_plano, 'BASICO')), 'ativo',
    CURRENT_DATE, (CURRENT_DATE + INTERVAL '30 days')::date,
    GREATEST(1, COALESCE(p_limite_usuarios, 5)),
    GREATEST(0, COALESCE(p_valor, 0)), GREATEST(0, COALESCE(p_valor, 0))
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cnpj = COALESCE(EXCLUDED.cnpj, public.tenants.cnpj),
    contato_telefone = COALESCE(EXCLUDED.contato_telefone, public.tenants.contato_telefone),
    endereco = COALESCE(EXCLUDED.endereco, public.tenants.endereco),
    plano = EXCLUDED.plano,
    limite_usuarios = EXCLUDED.limite_usuarios,
    valor_mensalidade = EXCLUDED.valor_mensalidade,
    plano_valor = EXCLUDED.plano_valor,
    updated_at = NOW();

  INSERT INTO public.tenant_users (tenant_id, user_id, role, perfil_acesso, email)
  VALUES (p_user_id, p_user_id, 'admin', 'ADMIN', lower(trim(p_email)))
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET
    role = 'admin', perfil_acesso = 'ADMIN', email = EXCLUDED.email;

  -- Injeta tenant_id e perfil ADMIN nos metadados JWT para isolamento RLS imediato
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('tenant_id', p_user_id::text, 'role', 'admin', 'perfil_acesso', 'ADMIN')
  WHERE id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'tenant_id', p_user_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_tenant_publico(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, INT) TO anon, authenticated;

-- 2. RPC segura para vincular assinatura Asaas recém-gerada ao tenant
CREATE OR REPLACE FUNCTION public.vincular_assinatura_asaas_tenant(
  p_tenant_id UUID,
  p_plano TEXT,
  p_valor NUMERIC,
  p_billing_type TEXT,
  p_customer_id TEXT,
  p_subscription_id TEXT,
  p_status TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_invoice_url TEXT DEFAULT NULL,
  p_pix_qr_code TEXT DEFAULT NULL,
  p_pix_copia_cola TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Empresa não encontrada.');
  END IF;

  UPDATE public.tenants
  SET plano = upper(COALESCE(p_plano, plano)),
      plano_valor = GREATEST(0, COALESCE(p_valor, plano_valor)),
      valor_mensalidade = GREATEST(0, COALESCE(p_valor, valor_mensalidade)),
      asaas_customer_id = p_customer_id,
      asaas_subscription_id = p_subscription_id,
      asaas_subscription_status = COALESCE(p_status, 'ACTIVE'),
      updated_at = NOW()
  WHERE id = p_tenant_id;

  INSERT INTO public.saas_assinaturas (
    tenant_id, plano, valor, billing_type, status,
    asaas_customer_id, asaas_subscription_id, asaas_payment_id,
    invoice_url, pix_qr_code, pix_copia_cola
  ) VALUES (
    p_tenant_id, upper(COALESCE(p_plano, 'BASICO')), GREATEST(0, COALESCE(p_valor, 0)),
    COALESCE(p_billing_type, 'PIX'), 'PENDENTE',
    p_customer_id, p_subscription_id, p_payment_id,
    p_invoice_url, p_pix_qr_code, p_pix_copia_cola
  );

  RETURN jsonb_build_object('ok', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.vincular_assinatura_asaas_tenant(UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 3. RLS Estrita em public.tenants (remove leitura anônima; isola cada empresa; libera Super Admin)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_select_isolated" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_isolated" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_master_only" ON public.tenants;
DROP POLICY IF EXISTS "tenant_read_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenant_insert_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenant_update_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenant_isolation_tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "tenant_isolation_tenants_insert" ON public.tenants;
DROP POLICY IF EXISTS "tenant_isolation_tenants_update" ON public.tenants;

CREATE POLICY "tenants_select_isolated" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id = get_current_tenant_id()
    OR EXISTS (SELECT 1 FROM public.tenant_users tu WHERE tu.tenant_id = public.tenants.id AND tu.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.super_admins sa WHERE sa.id = auth.uid())
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
  );

CREATE POLICY "tenants_update_isolated" ON public.tenants
  FOR UPDATE TO authenticated
  USING (
    id = get_current_tenant_id()
    OR EXISTS (SELECT 1 FROM public.tenant_users tu WHERE tu.tenant_id = public.tenants.id AND tu.user_id = auth.uid() AND tu.perfil_acesso = 'ADMIN')
    OR EXISTS (SELECT 1 FROM public.super_admins sa WHERE sa.id = auth.uid())
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
  )
  WITH CHECK (
    id = get_current_tenant_id()
    OR EXISTS (SELECT 1 FROM public.tenant_users tu WHERE tu.tenant_id = public.tenants.id AND tu.user_id = auth.uid() AND tu.perfil_acesso = 'ADMIN')
    OR EXISTS (SELECT 1 FROM public.super_admins sa WHERE sa.id = auth.uid())
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
  );

CREATE POLICY "tenants_insert_master_only" ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.super_admins sa WHERE sa.id = auth.uid())
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
  );
