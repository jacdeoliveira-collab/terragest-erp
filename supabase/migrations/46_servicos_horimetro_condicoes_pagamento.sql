-- ==============================================================================
-- TerraGest SaaS - Migração 46: Condições de Pagamento em Serviços por Horímetro
-- Requer a migração 45 (tabela contas_bancarias)
-- ==============================================================================

ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS condicao_pagamento VARCHAR(50);
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50);
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS conta_bancaria_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS prazo_descricao VARCHAR(200);
