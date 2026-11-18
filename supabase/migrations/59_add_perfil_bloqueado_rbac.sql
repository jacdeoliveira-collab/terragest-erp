-- ==============================================================================
-- TerraGest ERP - Migração 59: Adiciona perfil BLOQUEADO na constraint RBAC
-- ==============================================================================

ALTER TABLE public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_perfil_acesso_check;
ALTER TABLE public.tenant_users ADD CONSTRAINT tenant_users_perfil_acesso_check
  CHECK (perfil_acesso IN ('ADMIN', 'FINANCEIRO', 'ENGENHARIA', 'RH', 'OPERACIONAL', 'OPERADOR', 'BLOQUEADO'));

