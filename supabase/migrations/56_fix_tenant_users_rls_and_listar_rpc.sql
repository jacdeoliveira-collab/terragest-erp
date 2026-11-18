-- ==============================================================================
-- TerraGest ERP - Migração 56: Corrige recursão infinita na RLS de tenant_users
-- e adiciona RPC listar_usuarios_tenant (SECURITY DEFINER)
-- ==============================================================================

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

DROP POLICY IF EXISTS "tenant_users_select_policy" ON public.tenant_users;
CREATE POLICY "tenant_users_select_policy" ON public.tenant_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR tenant_id = get_current_tenant_id()
    OR public.is_tenant_admin(tenant_id)
  );

DROP POLICY IF EXISTS "tenant_users_write_policy" ON public.tenant_users;
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

CREATE OR REPLACE FUNCTION public.listar_usuarios_tenant(p_tenant_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  perfil_acesso VARCHAR(50),
  created_at TIMESTAMPTZ,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT (
    p_tenant_id = get_current_tenant_id()
    OR public.is_tenant_admin(p_tenant_id)
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = p_tenant_id AND tu.user_id = auth.uid()
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    tu.id,
    tu.user_id,
    tu.role::TEXT,
    tu.perfil_acesso,
    tu.created_at,
    COALESCE(NULLIF(TRIM(tu.email), ''), u.email)::TEXT AS email
  FROM public.tenant_users tu
  LEFT JOIN auth.users u ON u.id = tu.user_id
  WHERE tu.tenant_id = p_tenant_id
  ORDER BY tu.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_usuarios_tenant(UUID) TO authenticated;

