-- ==============================================================================
-- TerraGest SaaS - Migração 47: Parcelamento Flexível com Datas de Vencimento
-- Permite parcelar o saldo restante com valores e datas editáveis por parcela
-- ==============================================================================

ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS parcelas JSONB DEFAULT '[]';
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS parcelas JSONB DEFAULT '[]';

COMMENT ON COLUMN public.servicos_horimetro.parcelas IS 'Lista de parcelas acordadas: [{numero, valor, data_vencimento, forma_pagamento, status}]';
