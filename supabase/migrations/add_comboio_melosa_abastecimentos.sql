-- ==============================================================================
-- TerraGest SaaS - Migração: Suporte a Caminhão Comboio (Melosa) & Lubrificantes
-- ==============================================================================

-- 1. Adicionar colunas de rastreamento na tabela abastecimentos
ALTER TABLE public.abastecimentos
ADD COLUMN IF NOT EXISTS origem VARCHAR(20) DEFAULT 'POSTO' CHECK (origem IN ('POSTO', 'TANQUE_FIXO', 'COMBOIO'));

ALTER TABLE public.abastecimentos
ADD COLUMN IF NOT EXISTS comboio_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL;

ALTER TABLE public.abastecimentos
ADD COLUMN IF NOT EXISTS qtd_oleo_litros NUMERIC(10, 2) DEFAULT 0.00;

ALTER TABLE public.abastecimentos
ADD COLUMN IF NOT EXISTS qtd_graxa_kg NUMERIC(10, 2) DEFAULT 0.00;

-- 2. Índice de performance para consultas por caminhão comboio
CREATE INDEX IF NOT EXISTS idx_abastecimentos_comboio ON public.abastecimentos(comboio_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_origem ON public.abastecimentos(origem);
