-- 33_servico_multiplas_maquinas.sql
-- Suporte a múltiplas máquinas/equipamentos por serviço de horímetro

ALTER TABLE public.servicos_horimetro 
ADD COLUMN IF NOT EXISTS maquinas_itens JSONB DEFAULT '[]'::jsonb;

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
