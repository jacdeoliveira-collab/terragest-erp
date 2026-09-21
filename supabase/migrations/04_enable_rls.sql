-- ==============================================================================
-- TerraGest SaaS - Ativação de Row Level Security (RLS) & Políticas Multi-Tenant
-- Arquivo: 04_enable_rls.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Passo 1: Garantir que a coluna tenant_id exista em todas as tabelas
-- ------------------------------------------------------------------------------

ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE daily_bulletins 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE sipeagro_reports 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- (A tabela tenant_modulos já possui tenant_id por padrão)

-- Índices de performance para consultas filtradas por tenant_id
CREATE INDEX IF NOT EXISTS idx_equipment_tenant_id ON equipment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_daily_bulletins_tenant_id ON daily_bulletins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sipeagro_reports_tenant_id ON sipeagro_reports(tenant_id);

-- ------------------------------------------------------------------------------
-- Passo 2: Função Auxiliar para Obter o tenant_id do Usuário Autenticado
-- Busca primeiramente no app_metadata ou user_metadata do JWT do Supabase Auth.
-- Fallback para o próprio auth.uid() caso use modelo 1:1.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid,
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '')::uuid,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- Passo 3: Ativação do Row Level Security (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sipeagro_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_modulos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Passo 4: Políticas de Segurança Estritas por Tabela
-- ------------------------------------------------------------------------------

-- TABELA: equipment
DROP POLICY IF EXISTS "tenant_isolation_equipment_select" ON equipment;
CREATE POLICY "tenant_isolation_equipment_select" ON equipment
    FOR SELECT TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_equipment_insert" ON equipment;
CREATE POLICY "tenant_isolation_equipment_insert" ON equipment
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_equipment_update" ON equipment;
CREATE POLICY "tenant_isolation_equipment_update" ON equipment
    FOR UPDATE TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_equipment_delete" ON equipment;
CREATE POLICY "tenant_isolation_equipment_delete" ON equipment
    FOR DELETE TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);


-- TABELA: daily_bulletins
DROP POLICY IF EXISTS "tenant_isolation_daily_bulletins_select" ON daily_bulletins;
CREATE POLICY "tenant_isolation_daily_bulletins_select" ON daily_bulletins
    FOR SELECT TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_daily_bulletins_insert" ON daily_bulletins;
CREATE POLICY "tenant_isolation_daily_bulletins_insert" ON daily_bulletins
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_daily_bulletins_update" ON daily_bulletins;
CREATE POLICY "tenant_isolation_daily_bulletins_update" ON daily_bulletins
    FOR UPDATE TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_daily_bulletins_delete" ON daily_bulletins;
CREATE POLICY "tenant_isolation_daily_bulletins_delete" ON daily_bulletins
    FOR DELETE TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);


-- TABELA: sipeagro_reports
DROP POLICY IF EXISTS "tenant_isolation_sipeagro_reports_select" ON sipeagro_reports;
CREATE POLICY "tenant_isolation_sipeagro_reports_select" ON sipeagro_reports
    FOR SELECT TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_sipeagro_reports_insert" ON sipeagro_reports;
CREATE POLICY "tenant_isolation_sipeagro_reports_insert" ON sipeagro_reports
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_sipeagro_reports_update" ON sipeagro_reports;
CREATE POLICY "tenant_isolation_sipeagro_reports_update" ON sipeagro_reports
    FOR UPDATE TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_sipeagro_reports_delete" ON sipeagro_reports;
CREATE POLICY "tenant_isolation_sipeagro_reports_delete" ON sipeagro_reports
    FOR DELETE TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);


-- TABELA: tenant_modulos
DROP POLICY IF EXISTS "tenant_isolation_tenant_modulos_select" ON tenant_modulos;
CREATE POLICY "tenant_isolation_tenant_modulos_select" ON tenant_modulos
    FOR SELECT TO authenticated
    USING (tenant_id = get_current_tenant_id());

DROP POLICY IF EXISTS "tenant_isolation_tenant_modulos_all" ON tenant_modulos;
CREATE POLICY "tenant_isolation_tenant_modulos_all" ON tenant_modulos
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());
