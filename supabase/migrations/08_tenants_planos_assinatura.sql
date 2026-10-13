-- ==============================================================================
-- TerraGest SaaS - Migração 08: Planos Comerciais e Assinaturas (Tenants)
-- Arquivo: 08_tenants_planos_assinatura.sql (< 150 linhas)
-- ==============================================================================

-- 1. Criação da Tabela tenants caso não exista
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20),
    slogan VARCHAR(255),
    logo_url TEXT,
    plano VARCHAR(30) DEFAULT 'START' CHECK (plano IN ('START', 'PRO', 'ENTERPRISE')),
    plano_valor NUMERIC(10, 2) DEFAULT 1500.00,
    limite_usuarios INT DEFAULT 5,
    data_vencimento_fatura DATE,
    status_conta VARCHAR(20) DEFAULT 'ativo' CHECK (status_conta IN ('ativo', 'bloqueado', 'teste')),
    contato_email VARCHAR(150),
    contato_telefone VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garantia de Adição das Colunas em Bancos Existentes
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plano VARCHAR(30) DEFAULT 'START';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plano_valor NUMERIC(10, 2) DEFAULT 1500.00;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS limite_usuarios INT DEFAULT 5;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS data_vencimento_fatura DATE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status_conta VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contato_email VARCHAR(150);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contato_telefone VARCHAR(30);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slogan VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Atualizar Constraint do Plano para 'START', 'PRO', 'ENTERPRISE'
DO $$
BEGIN
    ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_plano_check;
    ALTER TABLE tenants ADD CONSTRAINT tenants_plano_check 
        CHECK (plano IN ('START', 'PRO', 'ENTERPRISE'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 4. Índices para Performance e Auditoria Comercial
CREATE INDEX IF NOT EXISTS idx_tenants_plano ON tenants(plano);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status_conta);
CREATE INDEX IF NOT EXISTS idx_tenants_vencimento ON tenants(data_vencimento_fatura);

-- 5. RLS na Tabela tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_superadmin_read_all" ON tenants;
CREATE POLICY "tenants_superadmin_read_all" ON tenants
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "tenants_superadmin_write_all" ON tenants;
CREATE POLICY "tenants_superadmin_write_all" ON tenants
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()) 
        OR auth.uid() IS NOT NULL
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()) 
        OR auth.uid() IS NOT NULL
    );
