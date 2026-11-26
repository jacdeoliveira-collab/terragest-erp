-- ==============================================================================
-- TerraGest ERP - Migração 69: Texto editável da caixa de confirmação nos planos
-- Permite que o Super Admin personalize título e texto do termo de aceite
-- exibido ao assinar ou trocar de plano.
-- ==============================================================================

ALTER TABLE public.saas_planos
  ADD COLUMN IF NOT EXISTS termo_titulo TEXT,
  ADD COLUMN IF NOT EXISTS termo_aceite_texto TEXT;

NOTIFY pgrst, 'reload schema';
