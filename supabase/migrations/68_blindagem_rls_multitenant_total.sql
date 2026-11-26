-- ==============================================================================
-- TerraGest ERP - Migração 68: BLINDAGEM TOTAL MULTITENANT (RLS EM TODAS TABELAS)
-- Corrige a brecha da migração 50 que permitia qualquer usuário autenticado ler
-- registros de tenant_id = '00000000-0000-0000-0000-000000000001' ou NULL.
-- A partir desta migração, NENHUMA empresa consegue ver dados de outra empresa.
-- ==============================================================================

-- 1. Função confiável (sem user_metadata) que verifica se o usuário pertence ao tenant
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

GRANT EXECUTE ON FUNCTION public.user_belongs_to_tenant(UUID) TO authenticated;

-- 2. Atribuir tenant_id da Matriz a registros legados que estavam com tenant_id NULL
-- e aplicar política RLS estrita (somente authenticated, zero vazamento entre tenants)
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
    -- Normaliza registros legados antigos sem tenant_id para a Matriz
    EXECUTE format(
      'UPDATE public.%I SET tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid WHERE tenant_id IS NULL;',
      r.table_name
    );

    -- Habilita RLS na tabela
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);

    -- Remove todas as políticas antigas/permissivas nesta tabela
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = r.table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, r.table_name);
    END LOOP;

    -- Cria política única blindada: cada empresa acessa EXCLUSIVAMENTE seus próprios dados
    EXECUTE format('
      CREATE POLICY %I ON public.%I
      FOR ALL TO authenticated
      USING (public.user_belongs_to_tenant(tenant_id))
      WITH CHECK (public.user_belongs_to_tenant(tenant_id));
    ', 'strict_rls_' || r.table_name, r.table_name);
  END LOOP;
END $$;

-- 3. Blindar também public.tenant_users (cada usuário vê só seus vínculos; Super Admin vê todos)
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

CREATE POLICY "strict_rls_tenant_users_write" ON public.tenant_users
  FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.tenant_users.tenant_id
        AND tu.user_id = (SELECT auth.uid())
        AND tu.perfil_acesso = 'ADMIN'
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.tenant_users.tenant_id
        AND tu.user_id = (SELECT auth.uid())
        AND tu.perfil_acesso = 'ADMIN'
    )
  );
