-- ==============================================================================
-- TerraGest SaaS - Migração 09: Gestão Jurídica de RH, SST e EPIs
-- Arquivo: 09_rh_sst_epis.sql (< 150 linhas)
-- ==============================================================================

-- 1. Atualizações na Tabela rh_funcionarios (Status, Vencimentos CNH e ASO)
ALTER TABLE rh_funcionarios 
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ATIVO',
    ADD COLUMN IF NOT EXISTS vencimento_cnh DATE,
    ADD COLUMN IF NOT EXISTS vencimento_aso DATE;

-- Sincronizar colunas se validade_cnh e aso_validade já existiam
UPDATE rh_funcionarios 
SET vencimento_cnh = COALESCE(vencimento_cnh, validade_cnh)
WHERE vencimento_cnh IS NULL AND validade_cnh IS NOT NULL;

UPDATE rh_funcionarios 
SET vencimento_aso = COALESCE(vencimento_aso, aso_validade)
WHERE vencimento_aso IS NULL AND aso_validade IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_venc_cnh ON rh_funcionarios(vencimento_cnh);
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_venc_aso ON rh_funcionarios(vencimento_aso);
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_status ON rh_funcionarios(status);

-- 2. Criação da Tabela epis_entregues (Ficha de Entrega de EPI - NR-6)
CREATE TABLE IF NOT EXISTS epis_entregues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    funcionario_id UUID NOT NULL REFERENCES rh_funcionarios(id) ON DELETE CASCADE,
    descricao_equipamento VARCHAR(200) NOT NULL,
    numero_ca VARCHAR(50) NOT NULL,
    data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade INT NOT NULL DEFAULT 1,
    motivo VARCHAR(100) DEFAULT 'ENTREGA_INICIAL',
    termo_assinado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantia de colunas e índices
ALTER TABLE epis_entregues ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE epis_entregues ADD COLUMN IF NOT EXISTS quantidade INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_epis_entregues_func ON epis_entregues(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_epis_entregues_tenant ON epis_entregues(tenant_id);

-- 3. Row Level Security (RLS) para epis_entregues
ALTER TABLE epis_entregues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_epis_entregues_all" ON epis_entregues;
CREATE POLICY "tenant_isolation_epis_entregues_all" ON epis_entregues
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);
