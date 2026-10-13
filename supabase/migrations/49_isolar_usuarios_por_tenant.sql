-- ==============================================================================
-- TerraGest SaaS - Migração 49: Isolamento Estrito de Usuários por Empresa (Tenant)
-- Arquivo: supabase/migrations/49_isolar_usuarios_por_tenant.sql (< 150 linhas)
-- ==============================================================================

-- 1. Remove qualquer vínculo acidental na tenant_users onde o usuário pertence a outra empresa
DELETE FROM public.tenant_users tu
WHERE EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = tu.user_id
      AND u.raw_user_meta_data ->> 'tenant_id' IS NOT NULL
      AND (u.raw_user_meta_data ->> 'tenant_id')::uuid != tu.tenant_id
);

-- 2. Remove vínculos da empresa legada (00000000-0000-0000-0000-000000000001) para administradores de outras empresas
DELETE FROM public.tenant_users tu
WHERE tu.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.tenants t ON (t.admin_email = u.email OR t.contato_email = u.email)
    WHERE u.id = tu.user_id
      AND t.id != '00000000-0000-0000-0000-000000000001'
);

-- 3. Garante que a política RLS de tenant_users permita que o usuário consulte apenas seus próprios vínculos
DROP POLICY IF EXISTS "tenant_users_select_policy" ON public.tenant_users;
CREATE POLICY "tenant_users_select_policy" ON public.tenant_users
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid())
    );
