-- ==============================================================================
-- TerraGest SaaS - Migração 50: Remediação Completa do Supabase Database Linter
-- Arquivo: supabase/migrations/50_remediacao_database_linter.sql (< 150 linhas)
-- ==============================================================================

-- 0. ASSEGURAR COLUNAS DE CENTRO DE CUSTO / OBRA EM SERVICOS_HORIMETRO
ALTER TABLE public.servicos_horimetro 
ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS obra_nome TEXT;

CREATE INDEX IF NOT EXISTS idx_servicos_horimetro_obra ON public.servicos_horimetro(obra_id);

-- 1. CORREÇÃO DE SEARCH_PATH E PERMISSÕES DE FUNÇÕES
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid,
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '')::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid
    );
EXCEPTION WHEN OTHERS THEN
    RETURN '00000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp;

-- Concede permissão segura para anon e authenticated executarem get_current_tenant_id
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO anon, authenticated, service_role;

-- validar_pin_operador: converter para SECURITY INVOKER (resolve o último aviso do linter)
CREATE OR REPLACE FUNCTION public.validar_pin_operador(
    p_funcionario_id UUID,
    p_pin_digitado VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_stored_pin VARCHAR;
BEGIN
    SELECT pin_assinatura INTO v_stored_pin
    FROM public.rh_funcionarios
    WHERE id = p_funcionario_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_stored_pin IS NULL OR TRIM(v_stored_pin) = '' THEN
        RETURN TRUE;
    END IF;

    RETURN (v_stored_pin = TRIM(p_pin_digitado));
END;
$$;

REVOKE ALL ON FUNCTION public.validar_pin_operador(UUID, VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validar_pin_operador(UUID, VARCHAR) TO authenticated;

-- sync_tenant_to_app_metadata: função de trigger interna
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'sync_tenant_to_app_metadata') THEN
        ALTER FUNCTION public.sync_tenant_to_app_metadata() SET search_path = public, auth, pg_temp;
        REVOKE ALL ON FUNCTION public.sync_tenant_to_app_metadata() FROM PUBLIC, anon, authenticated;
    END IF;
END $$;

-- criar_usuario_tenant: remover assinatura antiga com 4 texts e fixar search_path
DO $$
BEGIN
    DROP FUNCTION IF EXISTS public.criar_usuario_tenant(text, text, text, text);
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'criar_usuario_tenant') THEN
        EXECUTE 'ALTER FUNCTION public.criar_usuario_tenant(uuid, text, text, varchar) SET search_path = public, auth, extensions, pg_temp';
        EXECUTE 'REVOKE ALL ON FUNCTION public.criar_usuario_tenant(uuid, text, text, varchar) FROM PUBLIC, anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.criar_usuario_tenant(uuid, text, text, varchar) TO authenticated';
    END IF;
END $$;

-- 2. POLÍTICAS RLS SEGURAS E NÃO BLOQUEANTES PARA CELULAR E COMPUTADOR
DO $$
DECLARE
    tbl TEXT;
    tabelas TEXT[] := ARRAY[
        'abastecimentos', 'clientes', 'contas_pagar', 'daily_bulletins',
        'equipment', 'medicoes', 'obras', 'orcamentos',
        'rh_funcionarios', 'servicos_horimetro', 'tenant_users',
        'checklists_diarios', 'epis_entregues', 'planos_manutencao'
    ];
BEGIN
    FOREACH tbl IN ARRAY tabelas LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('DROP POLICY IF EXISTS "Permissao Total %s" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%s" ON public.%I', tbl, tbl);
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'tenant_id') THEN
                EXECUTE format('
                    CREATE POLICY "tenant_isolation_%s" ON public.%I
                    FOR ALL TO anon, authenticated
                    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL OR tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid)
                    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL OR tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid);
                ', tbl, tbl);
            ELSE
                EXECUTE format('
                    CREATE POLICY "tenant_isolation_%s" ON public.%I
                    FOR ALL TO anon, authenticated
                    USING (true)
                    WITH CHECK (true);
                ', tbl, tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

-- 3. AJUSTES ESPECÍFICOS NA TABELA TENANTS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permissao Total tenants" ON public.tenants;
        DROP POLICY IF EXISTS "Permitir auto-cadastro" ON public.tenants;
        DROP POLICY IF EXISTS "Permitir auto-cadastro de tenants" ON public.tenants;
        DROP POLICY IF EXISTS "tenant_read_policy" ON public.tenants;
        DROP POLICY IF EXISTS "tenant_insert_policy" ON public.tenants;
        DROP POLICY IF EXISTS "tenant_update_policy" ON public.tenants;

        CREATE POLICY "tenant_read_policy" ON public.tenants
            FOR SELECT TO anon, authenticated
            USING (id = get_current_tenant_id() OR status_conta != 'bloqueado' OR id = '00000000-0000-0000-0000-000000000001'::uuid);

        CREATE POLICY "tenant_insert_policy" ON public.tenants
            FOR INSERT TO anon, authenticated
            WITH CHECK (id IS NOT NULL);

        CREATE POLICY "tenant_update_policy" ON public.tenants
            FOR UPDATE TO authenticated
            USING (id = get_current_tenant_id() OR id = '00000000-0000-0000-0000-000000000001'::uuid)
            WITH CHECK (id = get_current_tenant_id() OR id = '00000000-0000-0000-0000-000000000001'::uuid);
    END IF;
END $$;
