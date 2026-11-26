-- ==============================================================================
-- TerraGest ERP - Migração 68: BLINDAGEM TOTAL MULTITENANT (RLS EM TODAS TABELAS)
-- Sem recursão em tenant_users (usa funções SECURITY DEFINER) e zero user_metadata.
-- ==============================================================================

-- 1. Função confiável: verifica se o usuário pertence ao tenant (bypassa RLS sem recursão)
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_tenant_id IS NOT NULL
    AND (
      public.is_super_admin()
      OR p_tenant_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.tenant_id = p_tenant_id
          AND tu.user_id = (SELECT auth.uid())
          AND COALESCE(tu.perfil_acesso, 'OPERADOR') <> 'BLOQUEADO'
      )
    );
$$;

-- 2. Função confiável: verifica se o usuário é ADMIN daquele tenant (sem recursão)
CREATE OR REPLACE FUNCTION public.is_tenant_admin(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_tenant_id IS NOT NULL
    AND (
      public.is_super_admin()
      OR p_tenant_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.tenant_id = p_tenant_id
          AND tu.user_id = (SELECT auth.uid())
          AND tu.perfil_acesso = 'ADMIN'
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.user_belongs_to_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_admin(UUID) TO authenticated;

-- 3. Normaliza registros legados (NULL -> Matriz) e aplica RLS estrita em TODAS tabelas
DO $$
DECLARE
  r RECORD;
  pol RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'tenant_id'
      AND t.table_type = 'BASE TABLE'
      AND c.table_name NOT IN ('tenants', 'tenant_users', 'saas_planos')
  LOOP
    EXECUTE format(
      'UPDATE public.%I SET tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid WHERE tenant_id IS NULL;',
      r.table_name
    );

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);

    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = r.table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, r.table_name);
    END LOOP;

    EXECUTE format('
      CREATE POLICY %I ON public.%I
      FOR ALL TO authenticated
      USING (public.user_belongs_to_tenant(tenant_id))
      WITH CHECK (public.user_belongs_to_tenant(tenant_id));
    ', 'strict_rls_' || r.table_name, r.table_name);
  END LOOP;
END $$;

-- 4. Blindar public.tenant_users SEM auto-referência (zero recursão infinita)
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenant_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.tenant_users;', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "strict_rls_tenant_users_select" ON public.tenant_users
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.user_belongs_to_tenant(tenant_id)
  );

CREATE POLICY "strict_rls_tenant_users_insert" ON public.tenant_users
  FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "strict_rls_tenant_users_update" ON public.tenant_users
  FOR UPDATE TO authenticated
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "strict_rls_tenant_users_delete" ON public.tenant_users
  FOR DELETE TO authenticated
  USING (public.is_tenant_admin(tenant_id));
