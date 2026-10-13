-- ==============================================================================
-- TerraGest SaaS - Configuração Cadastral da Empresa (Tenants)
-- Arquivo: add_empresa_config_tenants.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS razao_social VARCHAR(200);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contato_email VARCHAR(150);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contato_telefone VARCHAR(30);

-- Garantir que os tenants possam atualizar seus próprios dados cadastrais via RLS
DROP POLICY IF EXISTS "tenants_update_own" ON tenants;
CREATE POLICY "tenants_update_own" ON tenants
    FOR UPDATE TO authenticated
    USING (
      id = get_current_tenant_id() 
      OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
    )
    WITH CHECK (
      id = get_current_tenant_id() 
      OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
    );
