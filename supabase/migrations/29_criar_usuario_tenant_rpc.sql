-- ==============================================================================
-- TerraGest SaaS - RPC: Criar Usuário do Tenant sem deslogar Admin
-- Arquivo: 29_criar_usuario_tenant_rpc.sql (< 150 linhas)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.criar_usuario_tenant(
    p_tenant_id UUID,
    p_email TEXT,
    p_password TEXT,
    p_perfil_acesso VARCHAR(50)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;

    IF new_user_id IS NULL THEN
        new_user_id := gen_random_uuid();
        encrypted_pw := crypt(p_password, gen_salt('bf'));

        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            p_email,
            encrypted_pw,
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', array['email']),
            jsonb_build_object('tenant_id', p_tenant_id, 'perfil_acesso', p_perfil_acesso),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
    END IF;

    INSERT INTO public.tenant_users (
        tenant_id,
        user_id,
        role,
        perfil_acesso
    ) VALUES (
        p_tenant_id,
        new_user_id,
        CASE WHEN p_perfil_acesso = 'ADMIN' THEN 'admin' ELSE 'membro' END,
        p_perfil_acesso
    )
    ON CONFLICT (tenant_id, user_id)
    DO UPDATE SET
        perfil_acesso = EXCLUDED.perfil_acesso,
        role = EXCLUDED.role;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', p_email,
        'perfil_acesso', p_perfil_acesso
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_usuario_tenant(UUID, TEXT, TEXT, VARCHAR) TO authenticated;
