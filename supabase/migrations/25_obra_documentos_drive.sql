-- ==============================================================================
-- TerraGest SaaS - Módulo Compliance & Documentos da Obra (Drive)
-- Arquivo: 25_obra_documentos_drive.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.obra_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'OUTROS',
    orgao_emissor VARCHAR(120),
    data_validade DATE,
    drive_url TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_obra_documentos_tenant ON public.obra_documentos(tenant_id, obra_id);
CREATE INDEX IF NOT EXISTS idx_obra_documentos_validade ON public.obra_documentos(data_validade);

ALTER TABLE public.obra_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_obra_documentos" ON public.obra_documentos;
CREATE POLICY "tenant_isolation_obra_documentos" ON public.obra_documentos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.obra_documentos IS 'Repositório de licenças, ARTs, alvarás e laudos da obra vinculados ao Google Drive';
