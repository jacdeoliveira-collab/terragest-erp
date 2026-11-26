-- ==============================================================================
-- TerraGest ERP - Migração 67: Remediação Crítica do Supabase Security Advisor
-- Remove 100% das referências a user_metadata nas políticas RLS de
-- public.saas_planos e public.tenants (user_metadata é editável pelo cliente).
-- Usa apenas tabelas confiáveis (super_admins / tenant_users) + (select auth.uid()).
-- ==============================================================================

-- 1. Função confiável para validar Super Admin Master sem usar user_metadata
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.id = (SELECT auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.tenant_users tu
    WHERE tu.user_id = (SELECT auth.uid())
      AND tu.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND (tu.role IN ('admin', 'master', 'superadmin') OR tu.perfil_acesso = 'ADMIN')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 2. Corrigir RLS de public.saas_planos (zero user_metadata)
ALTER TABLE public.saas_planos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saas_planos_master_write" ON public.saas_planos;
CREATE POLICY "saas_planos_master_write" ON public.saas_planos
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 3. Corrigir RLS de public.tenants (zero user_metadata + InitPlan otimizado)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_select_isolated" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_isolated" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_master_only" ON public.tenants;

CREATE POLICY "tenants_select_isolated" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.tenants.id
        AND tu.user_id = (SELECT auth.uid())
    )
    OR public.is_super_admin()
  );

CREATE POLICY "tenants_update_isolated" ON public.tenants
  FOR UPDATE TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.tenants.id
        AND tu.user_id = (SELECT auth.uid())
        AND tu.perfil_acesso = 'ADMIN'
    )
    OR public.is_super_admin()
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.tenants.id
        AND tu.user_id = (SELECT auth.uid())
        AND tu.perfil_acesso = 'ADMIN'
    )
    OR public.is_super_admin()
  );

CREATE POLICY "tenants_insert_master_only" ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());
