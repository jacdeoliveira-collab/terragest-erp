-- ==============================================================================
-- TerraGest SaaS - Módulo 02: Frota & Recursos Humanos
-- Arquivo: 02_frota_rh.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela: equipment (Maquinário de Linha Amarela & Caminhões)
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'HEAVY_MACHINERY',
    type VARCHAR(50) NOT NULL DEFAULT 'ESCAVADEIRA',
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    current_hourmeter NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    battery_cycles INT DEFAULT 0,
    anac_prefix VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS current_hourmeter NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'AVAILABLE';

CREATE INDEX IF NOT EXISTS idx_equipment_tenant ON equipment(tenant_id);
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_equipment_all" ON equipment;
CREATE POLICY "tenant_isolation_equipment_all" ON equipment
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- 2. Tabela: rh_funcionarios (Operadores e Mecânicos)
CREATE TABLE IF NOT EXISTS rh_funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14),
    cargo VARCHAR(80) NOT NULL,
    documento VARCHAR(50),
    registro_documento VARCHAR(50),
    validade_documento DATE,
    telefone VARCHAR(25),
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS documento VARCHAR(50);
ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS registro_documento VARCHAR(50);
ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS validade_documento DATE;
ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ATIVO';

CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_tenant ON rh_funcionarios(tenant_id);
ALTER TABLE rh_funcionarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_rh_funcionarios_all" ON rh_funcionarios;
CREATE POLICY "tenant_isolation_rh_funcionarios_all" ON rh_funcionarios
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);
