-- ==============================================================================
-- TerraGest SaaS - Schema Inicial para PostgreSQL / Supabase
-- Tabelas de Maquinário Pesado, Drones Agrícolas (DJI Agras), BDE e MAPA/SIPEAGRO
-- ==============================================================================

-- 1. Tabela de Equipamentos
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('HEAVY_MACHINERY', 'AGRICULTURAL_DRONE')),
    type VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    current_hourmeter NUMERIC(10, 2) DEFAULT 0.0,
    battery_cycles INT DEFAULT 0,
    anac_prefix VARCHAR(50),
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_OPERATION', 'MAINTENANCE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Boletins Diários de Equipamento (BDE)
CREATE TABLE IF NOT EXISTS daily_bulletins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    operator_name VARCHAR(100) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    work_location VARCHAR(200) NOT NULL,
    initial_hourmeter NUMERIC(10, 2) NOT NULL,
    final_hourmeter NUMERIC(10, 2) NOT NULL,
    total_hours NUMERIC(10, 2) GENERATED ALWAYS AS (final_hourmeter - initial_hourmeter) STORED,
    fuel_liters NUMERIC(10, 2) DEFAULT 0.0,
    service_description TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Relatórios e Aplicações Regulatórias (MAPA / SIPEAGRO)
CREATE TABLE IF NOT EXISTS sipeagro_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    report_month VARCHAR(7) NOT NULL,
    recipe_number VARCHAR(100) NOT NULL,
    agronomist_crea VARCHAR(50) NOT NULL,
    farmer_name VARCHAR(150) NOT NULL,
    farm_name VARCHAR(150) NOT NULL,
    location_coords VARCHAR(100),
    target_crop VARCHAR(100) NOT NULL,
    target_pest VARCHAR(100) NOT NULL,
    product_commercial_name VARCHAR(150) NOT NULL,
    dosage_per_ha VARCHAR(50) NOT NULL,
    applied_area_ha NUMERIC(10, 2) NOT NULL,
    spray_volume_l_ha NUMERIC(10, 2) NOT NULL,
    wind_speed_kmh NUMERIC(5, 2),
    temperature_c NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_bde_equipment_date ON daily_bulletins(equipment_id, date);
CREATE INDEX IF NOT EXISTS idx_sipeagro_month ON sipeagro_reports(report_month);
