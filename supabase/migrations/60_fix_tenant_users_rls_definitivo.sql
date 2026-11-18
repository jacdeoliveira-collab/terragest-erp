-- ==============================================================================
-- TerraGest ERP - Migração 60: Remoção total de políticas recursivas em
-- tenant_users, constraint RBAC com BLOQUEADO e RPC atualizar_perfil_usuario_tenant
-- ==============================================================================

-- 1. Remove TODAS as políticas existentes em public.tenant_users (evita políticas antigas recursivas)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenant_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.tenant_users', pol.policyname);
  END LOOP;
END $$;

-- 2. Garantir constraints de perfil_acesso (incluindo BLOQUEADO) e role
ALTER TABLE public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_perfil_acesso_check;
ALTER TABLE public.tenant_users ADD CONSTRAINT tenant_users_perfil_acesso_check
  CHECK (perfil_acesso IN ('ADMIN', 'FINANCEIRO', 'ENGENHARIA', 'RH', 'OPERACIONAL', 'OPERADOR', 'BLOQUEADO'));

ALTER TABLE public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_role_check;

-- 3. Função SECURITY DEFINER para checar admin sem disparar RLS da própria tenant_users
CREATE OR REPLACE FUNCTION public.is_tenant_admin(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.tenant_id = p_tenant_id
      AND tu.user_id = auth.uid()
      AND (tu.role = 'admin' OR tu.perfil_acesso = 'ADMIN')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_admin(UUID) TO authenticated;

-- 4. Políticas RLS limpas e sem recursão em tenant_users
CREATE POLICY "tenant_users_select_policy" ON public.tenant_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR tenant_id = get_current_tenant_id()
    OR public.is_tenant_admin(tenant_id)
  );

CREATE POLICY "tenant_users_write_policy" ON public.tenant_users
  FOR ALL TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    OR public.is_tenant_admin(tenant_id)
  )
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR public.is_tenant_admin(tenant_id)
  );

-- 5. RPC SECURITY DEFINER para atualizar função/bloqueio de usuário com segurança
CREATE OR REPLACE FUNCTION public.atualizar_perfil_usuario_tenant(
  p_tenant_user_id UUID,
  p_perfil_acesso VARCHAR(50)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_perfil VARCHAR(50);
  v_role TEXT;
BEGIN
  v_perfil := UPPER(TRIM(p_perfil_acesso));
  IF v_perfil NOT IN ('ADMIN', 'FINANCEIRO', 'ENGENHARIA', 'RH', 'OPERACIONAL', 'OPERADOR', 'BLOQUEADO') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Perfil inválido: ' || v_perfil);
  END IF;

  SELECT tenant_id INTO v_tenant_id
  FROM public.tenant_users
  WHERE id = p_tenant_user_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vínculo de usuário não encontrado.');
  END IF;

  IF NOT (
    v_tenant_id = get_current_tenant_id()
    OR public.is_tenant_admin(v_tenant_id)
    OR EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para alterar usuários desta empresa.');
  END IF;

  v_role := CASE
    WHEN v_perfil = 'ADMIN' THEN 'admin'
    WHEN v_perfil = 'BLOQUEADO' THEN 'blocked'
    ELSE 'member'
  END;

  UPDATE public.tenant_users
  SET perfil_acesso = v_perfil,
      role = v_role
  WHERE id = p_tenant_user_id;

  RETURN jsonb_build_object('success', true, 'perfil_acesso', v_perfil, 'role', v_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_perfil_usuario_tenant(UUID, VARCHAR) TO authenticated;
