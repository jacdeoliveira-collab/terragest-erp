-- ==============================================================================
-- TerraGest SaaS - Migração 13: Módulo Comercial (Clientes e Orçamentos)
-- Arquivo: 13_comercial_orcamentos.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela: clientes (Contratantes de Locação e Serviços)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    nome VARCHAR(180) NOT NULL,
    documento VARCHAR(30), -- CPF ou CNPJ
    telefone VARCHAR(30),
    endereco TEXT,
    email VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas se existir
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS documento VARCHAR(30);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefone VARCHAR(30);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email VARCHAR(150);

CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_clientes_all" ON clientes;
CREATE POLICY "tenant_isolation_clientes_all" ON clientes
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP TRIGGER IF EXISTS trg_set_tenant_clientes ON clientes;
CREATE TRIGGER trg_set_tenant_clientes
    BEFORE INSERT ON clientes
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

-- 2. Tabela: orcamentos (Propostas Comerciais de Locação)
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    maquina_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    descricao_servico TEXT NOT NULL,
    valor_hora NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    horas_estimadas NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'CONCLUIDO')),
    data_proposta DATE DEFAULT CURRENT_DATE,
    validade_dias INT DEFAULT 15,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas se existir
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS maquina_id UUID REFERENCES equipment(id) ON DELETE SET NULL;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS data_proposta DATE DEFAULT CURRENT_DATE;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PENDENTE';

CREATE INDEX IF NOT EXISTS idx_orcamentos_tenant ON orcamentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);

ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_orcamentos_all" ON orcamentos;
CREATE POLICY "tenant_isolation_orcamentos_all" ON orcamentos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP TRIGGER IF EXISTS trg_set_tenant_orcamentos ON orcamentos;
CREATE TRIGGER trg_set_tenant_orcamentos
    BEFORE INSERT ON orcamentos
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();
