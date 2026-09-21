-- ==============================================================================
-- TerraGest SaaS - Resolução de Segurança: Security Advisor do Supabase
-- Arquivo: fix_security_advisor.sql (< 60 linhas)
-- Finalidade: Ativar RLS e políticas seguras nas tabelas apontadas no painel.
-- ==============================================================================

-- 1. Tabela: tenant_modulos (Ativação de RLS e Políticas)
ALTER TABLE IF EXISTS tenant_modulos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_tenant_modulos_all" ON tenant_modulos;
CREATE POLICY "tenant_isolation_tenant_modulos_all" ON tenant_modulos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- 2. Tabela legada: sipeagro_reports (Ativação de RLS e Políticas)
ALTER TABLE IF EXISTS sipeagro_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_sipeagro_reports_all" ON sipeagro_reports;
CREATE POLICY "tenant_isolation_sipeagro_reports_all" ON sipeagro_reports
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- NOTA: Se você preferir excluir completamente a tabela legada sipeagro_reports
-- (já que o TerraGest é 100% focado em Linha Amarela), você pode rodar:
-- DROP TABLE IF EXISTS sipeagro_reports CASCADE;
