-- ==============================================================================
-- TerraGest SaaS - Módulo de Integrações OAuth: Colunas completas
-- Arquivo: 39_expand_tenant_integrations.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE public.tenant_integrations
    ADD COLUMN IF NOT EXISTS account_email VARCHAR(150),
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'connected',
    ADD COLUMN IF NOT EXISTS folder_name TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.tenant_integrations.account_email IS 'E-mail da conta Google conectada via OAuth';
COMMENT ON COLUMN public.tenant_integrations.status IS 'Status da integração: connected, disconnected ou expired';
