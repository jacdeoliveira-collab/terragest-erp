-- ==============================================================================
-- TerraGest SaaS - Expansão ERP: RH, Checklists, Abastecimentos e Manutenção
-- Arquivo: 05_erp_expansion.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Criação das Tabelas do Módulo ERP
-- ------------------------------------------------------------------------------

-- 1.1 Tabela de Funcionários / Operadores / Mecânicos
CREATE TABLE IF NOT EXISTS rh_funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14),
    cargo VARCHAR(80) NOT NULL, -- Ex: 'OPERADOR_ESCAVADEIRA', 'OPERADOR_TRATOR', 'MECANICO', 'PILOTO_DRONE'
    registro_documento VARCHAR(50), -- CNH, CREA, ANAC
    validade_documento DATE,
    telefone VARCHAR(25),
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'FERIAS', 'AFASTADO', 'DESLIGADO')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Tabela de Checklists Diários de Inspeção Pré-Operacional
CREATE TABLE IF NOT EXISTS checklists_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    maquina_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
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

-- 1.3 Tabela de Abastecimentos e Gestão de Insumos
CREATE TABLE IF NOT EXISTS abastecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    maquina_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_combustivel VARCHAR(50) NOT NULL DEFAULT 'DIESEL_S10', -- Ex: 'DIESEL_S10', 'DIESEL_S500', 'ARLA_32', 'GASOLINA'
    quantidade_litros NUMERIC(10, 2) NOT NULL,
    horimetro_momento NUMERIC(10, 2) NOT NULL,
    valor_unitario NUMERIC(10, 3),
    valor_total NUMERIC(10, 2),
    posto_fornecedor VARCHAR(120),
    numero_requisicao_nf VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Tabela de Planos de Manutenção Preventiva e Lubrificação
CREATE TABLE IF NOT EXISTS planos_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    maquina_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    tipo_servico_nome VARCHAR(150) NOT NULL, -- Ex: 'Troca de Óleo Motor e Filtros', 'Engraxamento Geral', 'Revisão 250h'
    intervalo_horas NUMERIC(10, 2) NOT NULL, -- Ex: 250.0, 500.0, 1000.0
    ultimo_horimetro_realizado NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    proximo_horimetro_alvo NUMERIC(10, 2) GENERATED ALWAYS AS (ultimo_horimetro_realizado + intervalo_horas) STORED,
    data_ultima_execucao DATE,
    responsavel_mecanico VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'EM_DIA' CHECK (status IN ('EM_DIA', 'PROXIMO_VENCIMENTO', 'ATRASADO')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Índices de Performance Multi-Tenant
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_tenant ON rh_funcionarios(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_checklists_diarios_tenant ON checklists_diarios(tenant_id, data);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_tenant ON abastecimentos(tenant_id, data);
CREATE INDEX IF NOT EXISTS idx_planos_manutencao_tenant ON planos_manutencao(tenant_id, maquina_id);

-- ------------------------------------------------------------------------------
-- 3. Ativação de Row Level Security (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE rh_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_manutencao ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. Políticas de Segurança Estritas (Isolamento por tenant_id)
-- ------------------------------------------------------------------------------

-- POLÍTICAS: rh_funcionarios
DROP POLICY IF EXISTS "tenant_isolation_rh_funcionarios_all" ON rh_funcionarios;
CREATE POLICY "tenant_isolation_rh_funcionarios_all" ON rh_funcionarios
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- POLÍTICAS: checklists_diarios
DROP POLICY IF EXISTS "tenant_isolation_checklists_diarios_all" ON checklists_diarios;
CREATE POLICY "tenant_isolation_checklists_diarios_all" ON checklists_diarios
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- POLÍTICAS: abastecimentos
DROP POLICY IF EXISTS "tenant_isolation_abastecimentos_all" ON abastecimentos;
CREATE POLICY "tenant_isolation_abastecimentos_all" ON abastecimentos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- POLÍTICAS: planos_manutencao
DROP POLICY IF EXISTS "tenant_isolation_planos_manutencao_all" ON planos_manutencao;
CREATE POLICY "tenant_isolation_planos_manutencao_all" ON planos_manutencao
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());
