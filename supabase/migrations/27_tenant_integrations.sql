-- ==============================================================================
-- TerraGest SaaS - Módulo de Integrações OAuth (Google Drive, etc.)
-- Arquivo: 27_tenant_integrations.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    account_email VARCHAR(150),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    folder_id TEXT,
    folder_name TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'connected',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant ON public.tenant_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_provider ON public.tenant_integrations(provider);

ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_integrations_isolation" ON public.tenant_integrations;
CREATE POLICY "tenant_integrations_isolation" ON public.tenant_integrations
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.tenant_integrations IS 'Armazena tokens de conexões OAuth e parâmetros de integração (ex: Google Drive)';
