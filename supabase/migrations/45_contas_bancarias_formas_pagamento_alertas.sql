-- ==============================================================================
-- TerraGest SaaS - Migração 45: Contas Bancárias, Formas de Pagamento e Alertas
-- Arquivo: 45_contas_bancarias_formas_pagamento_alertas.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela: contas_bancarias (Caixas e Contas Bancárias da Empresa)
CREATE TABLE IF NOT EXISTS public.contas_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome_conta VARCHAR(100) NOT NULL,
    banco VARCHAR(100) NOT NULL DEFAULT 'Banco do Brasil',
    tipo_conta VARCHAR(50) NOT NULL DEFAULT 'CORRENTE' CHECK (tipo_conta IN ('CORRENTE', 'POUPANCA', 'CAIXA_FISICO')),
    agencia VARCHAR(30),
    numero_conta VARCHAR(50),
    titular VARCHAR(180),
    documento_titular VARCHAR(30),
    tipo_chave_pix VARCHAR(30) DEFAULT 'CNPJ' CHECK (tipo_chave_pix IN ('CNPJ', 'CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA')),
    chave_pix VARCHAR(150),
    saldo_inicial NUMERIC(12, 2) DEFAULT 0.00,
    is_padrao BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contas_bancarias_tenant ON public.contas_bancarias(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contas_bancarias_padrao ON public.contas_bancarias(tenant_id, is_padrao);

ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_contas_bancarias" ON public.contas_bancarias;
CREATE POLICY "tenant_isolation_contas_bancarias" ON public.contas_bancarias
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP TRIGGER IF EXISTS trg_set_tenant_contas_bancarias ON public.contas_bancarias;
CREATE TRIGGER trg_set_tenant_contas_bancarias
    BEFORE INSERT ON public.contas_bancarias
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

-- 2. Atualização na tabela orcamentos (Condição de Pagamento, Conta/Pix e Prazo)
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS condicao_pagamento VARCHAR(50) DEFAULT 'A_VISTA';
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) DEFAULT 'PIX';
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS conta_bancaria_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS prazo_descricao VARCHAR(200);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS chave_pix_manual VARCHAR(150);

-- 3. Atualização na tabela contas_pagar (Conta Bancária de Baixa, Condição e Chave Pix Fornecedor)
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS conta_bancaria_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS condicao_pagamento VARCHAR(50) DEFAULT 'A_VISTA';
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS chave_pix_fornecedor VARCHAR(150);
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS tipo_chave_pix_fornecedor VARCHAR(30);

-- 4. Atualização na tabela medicoes (Faturamento / Contas a Receber)
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS conta_bancaria_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS condicao_pagamento VARCHAR(50) DEFAULT '30_DIAS';
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) DEFAULT 'PIX';

COMMENT ON TABLE public.contas_bancarias IS 'Contas correntes, poupanças e caixas físicos com chave Pix para orçamentos e baixas';
