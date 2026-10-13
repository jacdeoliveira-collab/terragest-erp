-- =====================================================================
-- Migration 43: Adicionar coluna adiantamentos_historico em servicos_horimetro
-- Permite armazenar múltiplos adiantamentos / parcelas / a haver recebidos do cliente
-- =====================================================================

ALTER TABLE public.servicos_horimetro 
ADD COLUMN IF NOT EXISTS adiantamentos_historico JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.servicos_horimetro.adiantamentos_historico IS 'Array JSON com o histórico detalhado de pagamentos/adiantamentos recebidos do cliente (id, valor, data, forma_pagamento, observacao, numero_recibo)';
