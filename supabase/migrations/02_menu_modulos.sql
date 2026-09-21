-- ==============================================================================
-- TerraGest SaaS - Controle de Acesso Modular Multi-Tenant
-- Tabela: tenant_modulos
-- Controla a liberação dinâmica dos blocos (BDE, Obras, Frota, RH, etc.) por empresa
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tenant_modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    modulo_chave VARCHAR(50) NOT NULL, -- Ex: 'FROTA', 'BDE', 'OBRAS', 'RH', 'REGULATORY_MAPA'
    nome_exibicao VARCHAR(100) NOT NULL,
    icone_chave VARCHAR(50) NOT NULL,  -- Ex: 'truck', 'file-clock', 'hard-hat', 'users', 'shield-check'
    ordem INT DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tenant_modulo UNIQUE (tenant_id, modulo_chave)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_tenant_modulos_tenant_ativo 
ON tenant_modulos(tenant_id, ativo);

-- Comentários documentais
COMMENT ON TABLE tenant_modulos IS 'Armazena a liberação dinâmica de módulos/funcionalidades do TerraGest por empresa/tenant.';
COMMENT ON COLUMN tenant_modulos.modulo_chave IS 'Chave técnica única do módulo contratado pelo tenant.';
COMMENT ON COLUMN tenant_modulos.ativo IS 'Flag que define se o módulo está ativo e autorizado para renderização no menu.';
