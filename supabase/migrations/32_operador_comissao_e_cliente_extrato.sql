-- 32_operador_comissao_e_cliente_extrato.sql
-- Integração de remuneração e vales de operadores + status financeiro do cliente

-- 1. SERVICOS_HORIMETRO: Campos de comissão/hora e vales do operador + quitação do cliente
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS valor_hora_operador NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS adiantamento_operador_valor NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS adiantamento_operador_data DATE;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS saldo_pagar_operador NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS data_pagamento_operador DATE;
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS status_pagamento_operador VARCHAR(30) DEFAULT 'PENDENTE';
ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS status_pagamento_cliente VARCHAR(30) DEFAULT 'PENDENTE';

-- 2. ORCAMENTOS: Status de pagamento do cliente
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS status_pagamento_cliente VARCHAR(30) DEFAULT 'PENDENTE';

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
