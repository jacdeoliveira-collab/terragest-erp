-- ==============================================================================
-- TerraGest SaaS - Módulo Produção: Apontamento de Viagens / Sinaleiro (Ciclo de Terraplanagem)
-- Arquivo: 19_producao_apontamentos_viagens.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.apontamentos_viagens_producao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    caminhao_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
    escavadeira_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
    operador_caminhao_id UUID REFERENCES public.rh_funcionarios(id) ON DELETE SET NULL,
    apontador_id UUID REFERENCES public.rh_funcionarios(id) ON DELETE SET NULL,
    material_tipo VARCHAR(50) NOT NULL DEFAULT 'SOLO_COMUM',
    volume_m3 NUMERIC(10, 2) NOT NULL DEFAULT 12.00,
    origem_estaca VARCHAR(80),
    destino_estaca VARCHAR(80),
    dmt_km NUMERIC(8, 2) DEFAULT 1.00,
    numero_ticket VARCHAR(60) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apontamentos_viagens_tenant ON public.apontamentos_viagens_producao(tenant_id, obra_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_viagens_data ON public.apontamentos_viagens_producao(data_hora);
CREATE INDEX IF NOT EXISTS idx_apontamentos_viagens_caminhao ON public.apontamentos_viagens_producao(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_viagens_ticket ON public.apontamentos_viagens_producao(numero_ticket);

ALTER TABLE public.apontamentos_viagens_producao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_apontamentos_viagens" ON public.apontamentos_viagens_producao;
CREATE POLICY "tenant_isolation_apontamentos_viagens" ON public.apontamentos_viagens_producao
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.apontamentos_viagens_producao IS 'Apontamentos de produção de terraplanagem (Viagens, DMT e volume transportado emitidos pelo sinaleiro)';
