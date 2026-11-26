-- ==============================================================================
-- TerraGest ERP - Migração 64: Operador designado e vínculo direto da Agenda
-- Operacional com Serviços por Horímetro
-- ==============================================================================

ALTER TABLE public.agenda_operacional ADD COLUMN IF NOT EXISTS operador_id UUID;
ALTER TABLE public.agenda_operacional ADD COLUMN IF NOT EXISTS operador_nome TEXT;
ALTER TABLE public.agenda_operacional ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.servicos_horimetro(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agenda_operacional_servico ON public.agenda_operacional(servico_id);
