-- ==============================================================================
-- TerraGest SaaS - Módulo 03: Operações de Campo (BDE & Abastecimento)
-- Arquivo: 03_operacoes_campo.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela: daily_bulletins (Boletim Diário de Equipamento - BDE)
CREATE TABLE IF NOT EXISTS daily_bulletins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    obra_id UUID REFERENCES obras(id) ON DELETE RESTRICT,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    operador_id UUID REFERENCES rh_funcionarios(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    operator_name VARCHAR(100) NOT NULL DEFAULT 'Operador',
    client_name VARCHAR(150) NOT NULL DEFAULT 'Canteiro de Obras',
    work_location VARCHAR(200) NOT NULL DEFAULT 'Frente de Serviço',
    initial_hourmeter NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    final_hourmeter NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    total_hours NUMERIC(10, 2) DEFAULT 0.0,
    fuel_liters NUMERIC(10, 2) DEFAULT 0.0,
    service_description TEXT NOT NULL DEFAULT 'Operação de campo',
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES obras(id) ON DELETE RESTRICT;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS operador_id UUID REFERENCES rh_funcionarios(id) ON DELETE SET NULL;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS initial_hourmeter NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS final_hourmeter NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS total_hours NUMERIC(10, 2) DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS idx_daily_bulletins_tenant ON daily_bulletins(tenant_id, obra_id);
ALTER TABLE daily_bulletins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_daily_bulletins_all" ON daily_bulletins;
CREATE POLICY "tenant_isolation_daily_bulletins_all" ON daily_bulletins
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- 2. Tabela: abastecimentos (Controle de Diesel e Insumos da Obra)
CREATE TABLE IF NOT EXISTS abastecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    obra_id UUID REFERENCES obras(id) ON DELETE RESTRICT,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    maquina_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_combustivel VARCHAR(50) NOT NULL DEFAULT 'DIESEL_S10',
    quantidade_litros NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    horimetro_momento NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    valor_unitario NUMERIC(10, 3),
    valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    posto_fornecedor VARCHAR(120),
    numero_requisicao_nf VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES obras(id) ON DELETE RESTRICT;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS maquina_id UUID REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS quantidade_litros NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS horimetro_momento NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS valor_total NUMERIC(10, 2) DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS idx_abastecimentos_tenant ON abastecimentos(tenant_id, obra_id);
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_abastecimentos_all" ON abastecimentos;
CREATE POLICY "tenant_isolation_abastecimentos_all" ON abastecimentos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);
