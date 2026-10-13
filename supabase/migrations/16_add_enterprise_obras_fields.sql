-- ==============================================================================
-- TerraGest SaaS - Migração 16: Campos Enterprise em Centros de Custo (Obras)
-- Arquivo: 16_add_enterprise_obras_fields.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS cliente_nome VARCHAR(200);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS cliente_cnpj VARCHAR(30);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS cno VARCHAR(50);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS art_crea VARCHAR(50);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS endereco_completo TEXT;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS previsao_termino DATE;
