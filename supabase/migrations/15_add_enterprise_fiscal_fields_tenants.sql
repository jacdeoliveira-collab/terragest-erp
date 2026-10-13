-- ==============================================================================
-- TerraGest SaaS - Migração 15: Dados Fiscais e Responsabilidade Técnica (Tenants)
-- Arquivo: 15_add_enterprise_fiscal_fields_tenants.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(50);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS inscricao_municipal VARCHAR(50);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS cnae VARCHAR(30);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS responsavel_tecnico VARCHAR(150);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS registro_crea VARCHAR(50);
