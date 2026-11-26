-- ==============================================================================
-- TerraGest ERP - Migração 63: Campos Data e Ano Safra em Centros de Custo (obras)
-- ==============================================================================

ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS data_registro DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS ano_safra VARCHAR(20);

UPDATE public.obras
SET data_registro = COALESCE(data_registro, data_inicio, created_at::date, CURRENT_DATE)
WHERE data_registro IS NULL;

CREATE INDEX IF NOT EXISTS idx_obras_ano_safra ON public.obras(tenant_id, ano_safra);
CREATE INDEX IF NOT EXISTS idx_obras_data_registro ON public.obras(tenant_id, data_registro);
