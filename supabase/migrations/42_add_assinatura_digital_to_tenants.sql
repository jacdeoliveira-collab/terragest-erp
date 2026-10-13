-- 42_add_assinatura_digital_to_tenants.sql (< 150 linhas)
-- Adiciona coluna de assinatura digital/rubrica da empresa para documentos

ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS assinatura_digital_url TEXT;

ALTER TABLE public.abastecimentos
    ADD COLUMN IF NOT EXISTS foto_comprovante TEXT;
