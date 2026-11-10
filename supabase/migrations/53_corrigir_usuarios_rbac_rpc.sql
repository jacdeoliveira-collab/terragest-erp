-- ==============================================================================
-- TerraGest ERP - Migração 53: Correção do RPC criar_usuario_tenant & RLS RBAC Dinâmico
-- Arquivo: 53_corrigir_usuarios_rbac_rpc.sql (< 150 linhas)
-- ==============================================================================

-- 1. Adicionar coluna email em tenant_users para visualização direta na tabela
ALTER TABLE public.tenant_users ADD COLUMN IF NOT EXISTS email VARCHAR(150);

-- 2. Atualizar vínculos existentes com os dados dinâmicos do auth.users (sem emails fixos)
UPDATE public.tenant_users tu
SET email = u.email,
    user_id = u.id
FROM auth.users u
WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(tu.email))
   OR tu.user_id = u.id;

-- 3. Vincular dinamicamente administradores das empresas aos seus respectivos tenants
INSERT INTO public.tenant_users (tenant_id, user_id, role, perfil_acesso, email)
SELECT 
    t.id AS tenant_id,
    u.id AS user_id,
    'admin' AS role,
    'ADMIN' AS perfil_acesso,
    u.email
FROM auth.users u
JOIN public.tenants t ON (
    LOWER(TRIM(t.admin_email)) = LOWER(TRIM(u.email)) 
    OR LOWER(TRIM(t.contato_email)) = LOWER(TRIM(u.email))
    OR (u.raw_user_meta_data->>'tenant_id')::uuid = t.id
)
ON CONFLICT (tenant_id, user_id) 
DO UPDATE SET 
    email = EXCLUDED.email,
    role = 'admin',
    perfil_acesso = 'ADMIN';

-- 4. Ajustar política RLS dinâmica: Administrador da empresa vê os usuários da sua empresa
DROP POLICY IF EXISTS "tenant_users_select_policy" ON public.tenant_users;
CREATE POLICY "tenant_users_select_policy" ON public.tenant_users
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR tenant_id = get_current_tenant_id()
        OR EXISTS (
            SELECT 1 FROM public.tenant_users tu 
            WHERE tu.tenant_id = public.tenant_users.tenant_id
              AND tu.user_id = auth.uid() 
              AND tu.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "tenant_users_write_policy" ON public.tenant_users;
CREATE POLICY "tenant_users_write_policy" ON public.tenant_users
    FOR ALL TO authenticated
    USING (
        tenant_id = get_current_tenant_id()
        OR EXISTS (
            SELECT 1 FROM public.tenant_users tu 
            WHERE tu.tenant_id = public.tenant_users.tenant_id
              AND tu.user_id = auth.uid() 
              AND tu.role = 'admin'
        )
    );

-- 5. Criar / Atualizar RPC criar_usuario_tenant 100% dinâmico
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
    clean_email TEXT;
BEGIN
    clean_email := LOWER(TRIM(p_email));
    SELECT id INTO new_user_id FROM auth.users WHERE email = clean_email;

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
            clean_email,
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
        perfil_acesso,
        email
    ) VALUES (
        p_tenant_id,
        new_user_id,
        CASE WHEN p_perfil_acesso = 'ADMIN' THEN 'admin' ELSE 'membro' END,
        p_perfil_acesso,
        clean_email
    )
    ON CONFLICT (tenant_id, user_id)
    DO UPDATE SET
        perfil_acesso = EXCLUDED.perfil_acesso,
        role = EXCLUDED.role,
        email = EXCLUDED.email;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', clean_email,
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
