-- ==============================================================================
-- TerraGest SaaS - Migração 41: Adicionar Dia de Pagamento e Fechamento no RH
-- Arquivo: 41_add_dia_pagamento_to_funcionarios.sql
-- ==============================================================================

ALTER TABLE public.rh_funcionarios 
ADD COLUMN IF NOT EXISTS dia_pagamento INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS dia_fechamento INTEGER DEFAULT 31;
