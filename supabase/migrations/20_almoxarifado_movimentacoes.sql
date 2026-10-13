-- ==============================================================================
-- TerraGest SaaS - Módulo Almoxarifado: Recebimento de Materiais e Ticket de Balança
-- Arquivo: 20_almoxarifado_movimentacoes.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.almoxarifado_movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    tipo_movimentacao VARCHAR(30) NOT NULL DEFAULT 'ENTRADA',
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    fornecedor_nome VARCHAR(150),
    numero_nf VARCHAR(60),
    material_nome VARCHAR(150) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL DEFAULT 'TON',
    quantidade NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    ticket_balanca_numero VARCHAR(60),
    peso_bruto_kg NUMERIC(10, 2),
    tara_kg NUMERIC(10, 2),
    peso_liquido_kg NUMERIC(10, 2),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_almoxarifado_tenant ON public.almoxarifado_movimentacoes(tenant_id, obra_id);
CREATE INDEX IF NOT EXISTS idx_almoxarifado_data ON public.almoxarifado_movimentacoes(data);
CREATE INDEX IF NOT EXISTS idx_almoxarifado_material ON public.almoxarifado_movimentacoes(material_nome);
CREATE INDEX IF NOT EXISTS idx_almoxarifado_nf ON public.almoxarifado_movimentacoes(numero_nf);

ALTER TABLE public.almoxarifado_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_almoxarifado_movimentacoes" ON public.almoxarifado_movimentacoes;
CREATE POLICY "tenant_isolation_almoxarifado_movimentacoes" ON public.almoxarifado_movimentacoes
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.almoxarifado_movimentacoes IS 'Controle de entrada e saída de insumos pesados no canteiro de obras com ticket de balança e NF';
