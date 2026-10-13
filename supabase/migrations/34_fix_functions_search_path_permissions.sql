-- ==============================================================================
-- 34_fix_functions_search_path_permissions.sql (< 150 linhas)
-- Correção de segurança: Fixar search_path e restringir execução de RPCs
-- ==============================================================================

-- 1. get_current_tenant_id: fixar search_path e revogar acesso anon
ALTER FUNCTION public.get_current_tenant_id() 
    SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_current_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated;

-- 2. validar_pin_operador: fixar search_path e restringir a authenticated
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'validar_pin_operador'
    ) THEN
        EXECUTE 'ALTER FUNCTION public.validar_pin_operador SET search_path = public, pg_temp';
        EXECUTE 'REVOKE ALL ON FUNCTION public.validar_pin_operador FROM PUBLIC, anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.validar_pin_operador TO authenticated';
    END IF;
END $$;

-- 3. sync_tenant_to_app_metadata: função de trigger (não deve ser chamada via RPC)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'sync_tenant_to_app_metadata'
    ) THEN
        EXECUTE 'ALTER FUNCTION public.sync_tenant_to_app_metadata() SET search_path = public, auth, pg_temp';
        EXECUTE 'REVOKE ALL ON FUNCTION public.sync_tenant_to_app_metadata() FROM PUBLIC, anon, authenticated';
    END IF;
END $$;

-- 4. criar_usuario_tenant: remover versões antigas inseguras e restringir permissões
DO $$ 
BEGIN
    -- Se existir a versão legada com 4 parâmetros text
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'criar_usuario_tenant' 
        AND p.pronargs = 4 
        AND (SELECT typname FROM pg_type WHERE oid = p.proargtypes[0]) = 'text'
    ) THEN
        EXECUTE 'DROP FUNCTION public.criar_usuario_tenant(text, text, text, text)';
    END IF;

    -- Versão canônica com UUID do tenant
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'criar_usuario_tenant' 
        AND p.pronargs = 4 
        AND (SELECT typname FROM pg_type WHERE oid = p.proargtypes[0]) = 'uuid'
    ) THEN
        EXECUTE 'ALTER FUNCTION public.criar_usuario_tenant(uuid, text, text, varchar) SET search_path = public, auth, extensions, pg_temp';
        EXECUTE 'REVOKE ALL ON FUNCTION public.criar_usuario_tenant(uuid, text, text, varchar) FROM PUBLIC, anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.criar_usuario_tenant(uuid, text, text, varchar) TO authenticated';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
