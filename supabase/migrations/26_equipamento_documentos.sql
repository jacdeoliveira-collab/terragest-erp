-- ==============================================================================
-- TerraGest SaaS - Módulo Compliance & Documentos de Frota (Drive)
-- Arquivo: 26_equipamento_documentos.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.equipamento_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    equipamento_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'OUTROS',
    orgao_emissor VARCHAR(120),
    data_validade DATE,
    drive_url TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipamento_documentos_tenant ON public.equipamento_documentos(tenant_id, equipamento_id);
CREATE INDEX IF NOT EXISTS idx_equipamento_documentos_validade ON public.equipamento_documentos(data_validade);

ALTER TABLE public.equipamento_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_equipamento_documentos" ON public.equipamento_documentos;
CREATE POLICY "tenant_isolation_equipamento_documentos" ON public.equipamento_documentos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.equipamento_documentos IS 'Repositório de laudos NR-12, CRLV, apólices de seguro e manuais do equipamento vinculados ao Google Drive';
