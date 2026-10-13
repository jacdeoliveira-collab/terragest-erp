-- Migração: PIN de 4 dígitos para assinatura eletrônica no campo

-- 1. rh_funcionarios: armazena o PIN de 4 dígitos definido pelo gestor
ALTER TABLE public.rh_funcionarios 
ADD COLUMN IF NOT EXISTS pin_assinatura VARCHAR(4);

-- 2. daily_bulletins: flag indicando assinatura por PIN
ALTER TABLE public.daily_bulletins 
ADD COLUMN IF NOT EXISTS assinado_por_pin BOOLEAN DEFAULT false;

-- 3. abastecimentos: flag indicando assinatura por PIN
ALTER TABLE public.abastecimentos 
ADD COLUMN IF NOT EXISTS assinado_por_pin BOOLEAN DEFAULT false;

-- 4. checklists_diarios: flag indicando assinatura por PIN
ALTER TABLE public.checklists_diarios 
ADD COLUMN IF NOT EXISTS assinado_por_pin BOOLEAN DEFAULT false;
