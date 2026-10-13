-- ==============================================================================
-- TerraGest SaaS - Migração 40: Adicionar Centro de Custo / Obra aos Serviços por Horímetro
-- Arquivo: 40_add_obra_centro_custo_to_servicos.sql
-- ==============================================================================

ALTER TABLE public.servicos_horimetro 
ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS obra_nome TEXT;

CREATE INDEX IF NOT EXISTS idx_servicos_horimetro_obra ON public.servicos_horimetro(obra_id);
