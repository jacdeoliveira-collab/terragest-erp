-- 31_orcamentos_servicos_adiantamento.sql
-- Corrige: "Could not find the 'updated_at' column of 'orcamentos' in the schema cache"
-- e adiciona colunas de adiantamento (sinal) e fotos do trabalho.

-- ORCAMENTOS
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS valor_adiantamento NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_adiantamento DATE;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS forma_pagamento_adiantamento VARCHAR(60);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS saldo_restante NUMERIC(12, 2) DEFAULT 0;

-- SERVICOS_HORIMETRO
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS valor_adiantamento NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS data_adiantamento DATE;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS forma_pagamento_adiantamento VARCHAR(60);
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS saldo_restante NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS fotos_trabalho JSONB DEFAULT '[]'::jsonb;

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
