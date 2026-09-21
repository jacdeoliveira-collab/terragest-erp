-- ==============================================================================
-- TerraGest SaaS - Módulo 01: Core & Centros de Custo (Obras)
-- Arquivo: 01_core_obras.sql (< 150 linhas)
-- ==============================================================================

-- 1. Função Auxiliar Multi-Tenant (JWT / App Metadata)
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid,
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '')::uuid,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Tabela: obras (Centros de Custo / Canteiros de Obra)
CREATE TABLE IF NOT EXISTS obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    nome VARCHAR(150) NOT NULL,
    cliente VARCHAR(150),
    localizacao VARCHAR(200),
    data_inicio DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Garantia de Colunas em Bancos Pré-Existentes
ALTER TABLE obras ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS cliente VARCHAR(150);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS localizacao VARCHAR(200);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS data_inicio DATE DEFAULT CURRENT_DATE;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ATIVA';

-- 4. Índice de Performance
CREATE INDEX IF NOT EXISTS idx_obras_tenant ON obras(tenant_id);

-- 5. Row Level Security (RLS)
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_obras_all" ON obras;
CREATE POLICY "tenant_isolation_obras_all" ON obras
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);
