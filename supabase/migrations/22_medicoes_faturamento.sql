-- ==============================================================================
-- TerraGest SaaS - Módulo Medição & Faturamento
-- Arquivo: 22_medicoes_faturamento.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.medicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    competencia VARCHAR(7) NOT NULL, -- Formato: 'YYYY-MM'
    numero_medicao VARCHAR(50) NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    total_horas_produtivas NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    valor_total NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    status_pagamento VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vínculo na tabela daily_bulletins
ALTER TABLE public.daily_bulletins ADD COLUMN IF NOT EXISTS medicao_id UUID REFERENCES public.medicoes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_medicoes_tenant ON public.medicoes(tenant_id, obra_id);
CREATE INDEX IF NOT EXISTS idx_medicoes_competencia ON public.medicoes(competencia);
CREATE INDEX IF NOT EXISTS idx_daily_bulletins_medicao ON public.daily_bulletins(medicao_id);

ALTER TABLE public.medicoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_medicoes" ON public.medicoes;
CREATE POLICY "tenant_isolation_medicoes" ON public.medicoes
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.medicoes IS 'Consolidação de BDEs aprovados para emissão de faturamento mensal contra clientes';
