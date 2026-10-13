-- ==============================================================================
-- TerraGest SaaS - Migração 14: Vínculos de Múltiplos Tenants (Tenant Users)
-- Arquivo: 14_tenant_users_multitenant.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'membro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);

ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_users_select_policy" ON public.tenant_users;
CREATE POLICY "tenant_users_select_policy" ON public.tenant_users
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()) OR
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
    );

DROP POLICY IF EXISTS "tenant_users_write_policy" ON public.tenant_users;
CREATE POLICY "tenant_users_write_policy" ON public.tenant_users
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()) OR
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()) OR
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
    );
