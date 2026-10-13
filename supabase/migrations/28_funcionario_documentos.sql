-- ==============================================================================
-- TerraGest SaaS - Módulo Compliance & Documentos de RH (Drive)
-- Arquivo: 28_funcionario_documentos.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.funcionario_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'OUTROS',
    orgao_emissor VARCHAR(120),
    data_validade DATE,
    drive_url TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_func_documentos_tenant ON public.funcionario_documentos(tenant_id, funcionario_id);
CREATE INDEX IF NOT EXISTS idx_func_documentos_validade ON public.funcionario_documentos(data_validade);

ALTER TABLE public.funcionario_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_funcionario_documentos" ON public.funcionario_documentos;
CREATE POLICY "tenant_isolation_funcionario_documentos" ON public.funcionario_documentos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

COMMENT ON TABLE public.funcionario_documentos IS 'Repositório de CNH, ASO, Fichas de EPI e Treinamentos vinculados ao Google Drive';
