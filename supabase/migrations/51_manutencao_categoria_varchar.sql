-- Migration: 51_manutencao_categoria_varchar.sql
-- Garante que categoria_custo_id aceite tanto UUIDs quanto identificadores textuais amigáveis

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'planos_manutencao' AND column_name = 'categoria_custo_id'
    ) THEN
        ALTER TABLE public.planos_manutencao ALTER COLUMN categoria_custo_id TYPE VARCHAR(100);
    ELSE
        ALTER TABLE public.planos_manutencao ADD COLUMN categoria_custo_id VARCHAR(100);
    END IF;
END $$;

