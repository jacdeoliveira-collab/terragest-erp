-- ==============================================================================
-- TerraGest SaaS - Resolução de Segurança: Security Advisor do Supabase
-- Arquivo: fix_security_advisor.sql (< 150 linhas)
-- ==============================================================================

-- 1. Revogar execução indevida da trigger pela API pública
REVOKE EXECUTE ON FUNCTION public.set_current_tenant_id() FROM PUBLIC, anon, authenticated;

-- 2. Converter get_current_tenant_id para SECURITY INVOKER
DROP FUNCTION IF EXISTS public.get_current_tenant_id() CASCADE;
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid,
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '')::uuid,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

-- 3. Dropar e recriar convidar_colaborador_rh como SECURITY INVOKER
DROP FUNCTION IF EXISTS public.convidar_colaborador_rh(uuid, character varying);
DROP FUNCTION IF EXISTS public.convidar_colaborador_rh(uuid, text);

CREATE OR REPLACE FUNCTION public.convidar_colaborador_rh(
    p_funcionario_id UUID,
    p_email VARCHAR(150)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_funcionario_nome VARCHAR(150);
BEGIN
    SELECT tenant_id, nome INTO v_tenant_id, v_funcionario_nome
    FROM public.rh_funcionarios
    WHERE id = p_funcionario_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Colaborador não encontrado.');
    END IF;

    UPDATE public.rh_funcionarios
    SET email_acesso = LOWER(TRIM(p_email)),
        status_convite = 'PENDENTE',
        updated_at = NOW()
    WHERE id = p_funcionario_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite registrado com sucesso.',
        'tenant_id', v_tenant_id,
        'email', LOWER(TRIM(p_email)),
        'nome', v_funcionario_nome
    );
END;
$$;

-- 4. Dropar e recriar invite_user_to_tenant como SECURITY INVOKER
DROP FUNCTION IF EXISTS public.invite_user_to_tenant(text, text, uuid);

CREATE OR REPLACE FUNCTION public.invite_user_to_tenant(
    p_email TEXT,
    p_role TEXT,
    p_target_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    
    IF v_clean_email IS NULL OR v_clean_email = '' OR v_clean_email NOT LIKE '%@%' THEN
        RETURN jsonb_build_object('success', false, 'error', 'E-mail inválido.');
    END IF;

    IF p_role = 'operador' THEN
        UPDATE public.rh_funcionarios
        SET email_acesso = v_clean_email,
            status_convite = 'PENDENTE',
            tenant_id = COALESCE(tenant_id, p_target_tenant_id),
            updated_at = NOW()
        WHERE (LOWER(TRIM(email_acesso)) = v_clean_email OR tenant_id = p_target_tenant_id)
          AND (email_acesso = v_clean_email OR id = p_target_tenant_id);
    END IF;

    IF p_role = 'admin' AND p_target_tenant_id IS NOT NULL THEN
        UPDATE public.tenants
        SET admin_email = v_clean_email,
            updated_at = NOW()
        WHERE id = p_target_tenant_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite gerado com sucesso para ' || v_clean_email,
        'email', v_clean_email,
        'role', p_role,
        'tenant_id', p_target_tenant_id
    );
END;
$$;

-- Revogar qualquer execução anônima ou pública
REVOKE ALL ON FUNCTION public.convidar_colaborador_rh(uuid, character varying) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.invite_user_to_tenant(text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convidar_colaborador_rh(uuid, character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_user_to_tenant(text, text, uuid) TO authenticated;

-- 6. Ativação de RLS em tabelas pendentes (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_modulos') THEN
        ALTER TABLE public.tenant_modulos ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "tenant_isolation_tenant_modulos_all" ON public.tenant_modulos;
        CREATE POLICY "tenant_isolation_tenant_modulos_all" ON public.tenant_modulos
            FOR ALL TO authenticated
            USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
            WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);
    END IF;
END $$;
