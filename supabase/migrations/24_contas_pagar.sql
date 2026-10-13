-- ==============================================================================
-- TerraGest SaaS - Módulo Contas a Pagar (Gestão de Passivos e Despesas)
-- Arquivo: 24_contas_pagar.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    descricao VARCHAR(200) NOT NULL,
    fornecedor VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL DEFAULT 'OUTROS',
    valor NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    forma_pagamento VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_tenant ON public.contas_pagar(tenant_id, obra_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON public.contas_pagar(categoria);

ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_contas_pagar" ON public.contas_pagar;
CREATE POLICY "tenant_isolation_contas_pagar" ON public.contas_pagar
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.contas_pagar IS 'Gestão de despesas, passivos operacionais e conciliação bancária de pagamentos';
