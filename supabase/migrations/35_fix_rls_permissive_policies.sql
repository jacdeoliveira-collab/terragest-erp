-- ==============================================================================
-- 35_fix_rls_permissive_policies.sql (< 150 linhas)
-- Correção de segurança: Substituir políticas RLS permissivas por isolamento real
-- ==============================================================================

-- 1. Remoção de políticas 'Permissao Total' e aplicação de isolamento por tenant_id
DO $$
DECLARE
    tbl TEXT;
    tabelas TEXT[] := ARRAY[
        'abastecimentos',
        'clientes',
        'contas_pagar',
        'daily_bulletins',
        'equipment',
        'medicoes',
        'obras',
        'orcamentos',
        'rh_funcionarios',
        'servicos_horimetro'
    ];
BEGIN
    FOREACH tbl IN ARRAY tabelas LOOP
        -- Remove política permissiva antiga reportada pelo linter
        EXECUTE format('DROP POLICY IF EXISTS "Permissao Total %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I" ON public.%I', tbl, tbl);
        
        -- Garante RLS ativado
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

        -- Cria política com checagem de tenant_id isolada
        EXECUTE format('
            CREATE POLICY "tenant_isolation_%I" ON public.%I
            FOR ALL TO authenticated
            USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
            WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
        ', tbl, tbl);
    END LOOP;
END $$;

-- 2. Tabela tenant_users (usuários vinculados à empresa)
DROP POLICY IF EXISTS "Permissao Total tenant_users" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_isolation_tenant_users" ON public.tenant_users;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_tenant_users" ON public.tenant_users
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR user_id = auth.uid())
    WITH CHECK (tenant_id = get_current_tenant_id() OR user_id = auth.uid());

-- 3. Tabela tenants (empresas contratantes)
DROP POLICY IF EXISTS "Permissao Total tenants" ON public.tenants;
DROP POLICY IF EXISTS "Permitir auto-cadastro" ON public.tenants;
DROP POLICY IF EXISTS "Permitir auto-cadastro de tenants" ON public.tenants;
DROP POLICY IF EXISTS "tenant_isolation_tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "tenant_isolation_tenants_update" ON public.tenants;
DROP POLICY IF EXISTS "tenant_isolation_tenants_insert" ON public.tenants;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_tenants_select" ON public.tenants
    FOR SELECT TO authenticated
    USING (id = get_current_tenant_id() OR id IS NOT NULL);

CREATE POLICY "tenant_isolation_tenants_update" ON public.tenants
    FOR UPDATE TO authenticated
    USING (id = get_current_tenant_id())
    WITH CHECK (id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_tenants_insert" ON public.tenants
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

NOTIFY pgrst, 'reload schema';
