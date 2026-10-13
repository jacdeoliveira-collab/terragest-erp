-- ==============================================================================
-- TerraGest SaaS - Módulo Manutenção: Integração com Centros de Custo (Obras) e Categorias
-- Arquivo: 17_manutencoes_custos_enterprise.sql (< 150 linhas)
-- ==============================================================================

-- 1. Criação da Tabela de Categorias de Custo se não existir
CREATE TABLE IF NOT EXISTS public.categorias_custos (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    modulo VARCHAR(50) NOT NULL DEFAULT 'MANUTENCAO',
    tipo VARCHAR(30) NOT NULL DEFAULT 'DESPESA',
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_custos_tenant ON public.categorias_custos(tenant_id, modulo);
ALTER TABLE public.categorias_custos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_categorias_custos" ON public.categorias_custos;
CREATE POLICY "tenant_isolation_categorias_custos" ON public.categorias_custos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- 2. Expansão de colunas financeiras e Centro de Custo na tabela de manutenção
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL;
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS categoria_custo_id VARCHAR(100);
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS valor_pecas NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS valor_mao_obra NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS tipo_manutencao VARCHAR(50) DEFAULT 'PREVENTIVA';
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS data_servico DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.planos_manutencao ADD COLUMN IF NOT EXISTS descricao_servico TEXT;

-- 3. Criação de view/sinônimo manutencoes para compatibilidade se requisitada
CREATE OR REPLACE VIEW public.manutencoes AS
SELECT * FROM public.planos_manutencao;

-- 4. Seed de categorias padrão para Manutenção
INSERT INTO public.categorias_custos (id, nome, modulo, tipo)
VALUES
    ('cat-manut-pecas', 'Peças de Reposição & Desgaste', 'MANUTENCAO', 'DESPESA'),
    ('cat-manut-lubrificantes', 'Óleos, Filtros e Lubrificantes', 'MANUTENCAO', 'DESPESA'),
    ('cat-manut-mao-obra', 'Mão de Obra Externa / Terceirizada', 'MANUTENCAO', 'DESPESA'),
    ('cat-manut-rodante', 'Pneus e Material Rodante', 'MANUTENCAO', 'DESPESA'),
    ('cat-manut-revisao', 'Revisão Preventiva Concessionária', 'MANUTENCAO', 'DESPESA')
ON CONFLICT (id) DO NOTHING;
