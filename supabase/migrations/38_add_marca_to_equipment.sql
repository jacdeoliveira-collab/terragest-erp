-- ==============================================================================
-- TerraGest SaaS - Módulo Frota: Adicionar coluna 'marca' em equipment
-- Arquivo: 38_add_marca_to_equipment.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE public.equipment
    ADD COLUMN IF NOT EXISTS marca VARCHAR(100);

COMMENT ON COLUMN public.equipment.marca IS 'Fabricante / Marca do equipamento ou veículo (ex: Toyota, Caterpillar, Volvo)';

CREATE INDEX IF NOT EXISTS idx_equipment_marca ON public.equipment(marca);
