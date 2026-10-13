-- ==============================================================================
-- TerraGest SaaS - Migração 10: Planos Comerciais e Cobrança de Tenants
-- Arquivo: 10_tenants_cobranca.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela tenants: Garantir colunas solicitadas
ALTER TABLE tenants 
    ADD COLUMN IF NOT EXISTS plano VARCHAR(30) DEFAULT 'START',
    ADD COLUMN IF NOT EXISTS valor_mensalidade NUMERIC(10, 2) DEFAULT 1500.00,
    ADD COLUMN IF NOT EXISTS admin_email VARCHAR(150),
    ADD COLUMN IF NOT EXISTS data_vencimento_fatura INT DEFAULT 10;

-- Sincronizar com colunas legadas se existirem
UPDATE tenants 
SET valor_mensalidade = COALESCE(valor_mensalidade, plano_valor, 1500.00)
WHERE valor_mensalidade IS NULL;

UPDATE tenants 
SET admin_email = COALESCE(admin_email, contato_email)
WHERE admin_email IS NULL AND contato_email IS NOT NULL;

-- 2. Garantir restrição de Plano
DO $$
BEGIN
    ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_plano_check;
    ALTER TABLE tenants ADD CONSTRAINT tenants_plano_check 
        CHECK (plano IN ('START', 'PRO', 'ENTERPRISE'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Índices para cobrança e gestão de contratos
CREATE INDEX IF NOT EXISTS idx_tenants_plano_cob ON tenants(plano);
CREATE INDEX IF NOT EXISTS idx_tenants_vencimento_dia ON tenants(data_vencimento_fatura);
CREATE INDEX IF NOT EXISTS idx_tenants_admin_email ON tenants(admin_email);
