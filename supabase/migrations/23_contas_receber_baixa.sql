-- ==============================================================================
-- TerraGest SaaS - Módulo Contas a Receber: Baixa de Títulos e Conciliação
-- Arquivo: 23_contas_receber_baixa.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_medicoes_vencimento ON public.medicoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_medicoes_status ON public.medicoes(status_pagamento);
