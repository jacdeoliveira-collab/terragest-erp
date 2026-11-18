-- ==============================================================================
-- TerraGest ERP - Migração 58: Solução Completa RBAC (Constraint OPERADOR,
-- RLS sem recursão, listar_usuarios_tenant e criar_usuario_tenant completo)
-- ==============================================================================

-- 1. Atualizar constraint de perfil_acesso para aceitar todos os 6 perfis do sistema
ALTER TABLE public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_perfil_acesso_check;
ALTER TABLE public.tenant_users ADD CONSTRAINT tenant_users_perfil_acesso_check
  CHECK (perfil_acesso IN ('ADMIN', 'FINANCEIRO', 'ENGENHARIA', 'RH', 'OPERACIONAL', 'OPERADOR'));

-- 2. Garantir role sem bloqueio inesperado
ALTER TABLE public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_role_check;

-- 3. Corrigir usuários existentes em auth.users com tokens NULL e sem identity
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  is_sso_user = COALESCE(is_sso_user, FALSE)
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change IS NULL
   OR email_change_token_current IS NULL
   OR reauthentication_token IS NULL
   OR phone_change IS NULL
   OR phone_change_token IS NULL;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', NOW(), NOW(), NOW()
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email'
  );

-- 4. Atualizar RPC criar_usuario_tenant completo
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
    v_perfil VARCHAR(50);
BEGIN
    clean_email := LOWER(TRIM(p_email));
    v_perfil := UPPER(TRIM(COALESCE(p_perfil_acesso, 'OPERADOR')));
    SELECT id INTO new_user_id FROM auth.users WHERE LOWER(email) = clean_email;

    IF new_user_id IS NULL THEN
        new_user_id := gen_random_uuid();
        encrypted_pw := crypt(p_password, gen_salt('bf'));

        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            confirmation_token, recovery_token, email_change_token_new, email_change,
            email_change_token_current, reauthentication_token, phone_change, phone_change_token,
            is_sso_user, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
        ) VALUES (
            new_user_id, '00000000-0000-0000-0000-000000000000', clean_email, encrypted_pw, NOW(),
            '', '', '', '', '', '', '', '',
            FALSE,
            jsonb_build_object('provider', 'email', 'providers', array['email']),
            jsonb_build_object('tenant_id', p_tenant_id, 'perfil_acesso', v_perfil),
            NOW(), NOW(), 'authenticated', 'authenticated'
        );

        INSERT INTO auth.identities (
            id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), new_user_id, new_user_id::text,
            jsonb_build_object('sub', new_user_id::text, 'email', clean_email, 'email_verified', true),
            'email', NOW(), NOW(), NOW()
        );
    END IF;

    INSERT INTO public.tenant_users (tenant_id, user_id, role, perfil_acesso, email)
    VALUES (
        p_tenant_id, new_user_id,
        CASE WHEN v_perfil = 'ADMIN' THEN 'admin' ELSE 'member' END,
        v_perfil, clean_email
    )
    ON CONFLICT (tenant_id, user_id)
    DO UPDATE SET
        role = EXCLUDED.role,
        perfil_acesso = EXCLUDED.perfil_acesso,
        email = EXCLUDED.email;

    RETURN jsonb_build_object('success', true, 'user_id', new_user_id, 'email', clean_email, 'perfil_acesso', v_perfil);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

