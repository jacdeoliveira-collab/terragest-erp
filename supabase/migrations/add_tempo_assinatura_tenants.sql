-- Migração: Tempo de assinatura e vigência de contratos dos Tenants (Construtoras)

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS assinatura_inicio DATE DEFAULT CURRENT_DATE;

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS assinatura_fim DATE;
