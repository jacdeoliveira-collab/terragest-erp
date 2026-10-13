-- Migration 44: Adicionar despesas_itens em servicos_horimetro e suporte a comprovantes detalhados de despesas
-- Permite cadastrar Peças, Lubrificantes, Manutenção e Logística diretamente no serviço, anexando cupons fiscais e integrando ao Contas a Pagar.

ALTER TABLE public.servicos_horimetro 
ADD COLUMN IF NOT EXISTS despesas_itens JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.servicos_horimetro.despesas_itens IS 'Array JSON com as despesas discriminadas do serviço (id, categoria, descricao, fornecedor, valor, data, forma_pagamento, status_pagamento, comprovante_url)';
