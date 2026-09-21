-- ==============================================================================
-- TerraGest SaaS - Módulo 04: Manutenção & Checklists de Linha Amarela
-- Arquivo: 04_manutencao_checklists.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela: planos_manutencao (Revisões e Lubrificação)
CREATE TABLE IF NOT EXISTS planos_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    maquina_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    servico VARCHAR(150),
    tipo_servico_nome VARCHAR(150),
    intervalo_horas NUMERIC(10, 2) NOT NULL DEFAULT 250.0,
    ultimo_horimetro NUMERIC(10, 2) DEFAULT 0.0,
    ultimo_horimetro_realizado NUMERIC(10, 2) DEFAULT 0.0,
    data_ultima_execucao DATE DEFAULT CURRENT_DATE,
    responsavel_mecanico VARCHAR(100),
    status VARCHAR(30) DEFAULT 'EM_DIA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS maquina_id UUID REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS servico VARCHAR(150);
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS tipo_servico_nome VARCHAR(150);
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS intervalo_horas NUMERIC(10, 2) DEFAULT 250.0;
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS ultimo_horimetro NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS ultimo_horimetro_realizado NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE planos_manutencao ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'EM_DIA';

CREATE INDEX IF NOT EXISTS idx_planos_manutencao_tenant ON planos_manutencao(tenant_id);
ALTER TABLE planos_manutencao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_planos_manutencao" ON planos_manutencao;
CREATE POLICY "tenant_isolation_planos_manutencao" ON planos_manutencao
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- 2. Tabela: checklists_diarios (Inspeção Pré-Operação)
CREATE TABLE IF NOT EXISTS checklists_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    maquina_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    operador_id UUID REFERENCES rh_funcionarios(id) ON DELETE SET NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    nivel_oleo_ok BOOLEAN NOT NULL DEFAULT true,
    vazamentos_ok BOOLEAN NOT NULL DEFAULT true,
    nivel_arrefecimento_ok BOOLEAN NOT NULL DEFAULT true,
    freios_comandos_ok BOOLEAN NOT NULL DEFAULT true,
    pneus_esteiras_ok BOOLEAN NOT NULL DEFAULT true,
    iluminacao_alarme_ok BOOLEAN NOT NULL DEFAULT true,
    status_geral_aprovado BOOLEAN NOT NULL DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS maquina_id UUID REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS operador_id UUID REFERENCES rh_funcionarios(id) ON DELETE SET NULL;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS data DATE DEFAULT CURRENT_DATE;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS nivel_oleo_ok BOOLEAN DEFAULT true;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS vazamentos_ok BOOLEAN DEFAULT true;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS status_geral_aprovado BOOLEAN DEFAULT true;
ALTER TABLE checklists_diarios ADD COLUMN IF NOT EXISTS observacoes TEXT;

CREATE INDEX IF NOT EXISTS idx_checklists_diarios_tenant ON checklists_diarios(tenant_id, data);
ALTER TABLE checklists_diarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_checklists_diarios" ON checklists_diarios;
CREATE POLICY "tenant_isolation_checklists_diarios" ON checklists_diarios
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);
