-- ==============================================================================
-- TERGEST ERP - ESTRUTURAÇÃO DO PAINEL MASTER / SAAS SUPER ADMIN
-- ==============================================================================

-- 1. TABELA DE CONTROLE DE EMPRESAS CLIENTES (TENANTS)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  slogan VARCHAR(255),
  logo_url TEXT,
  plano_valor NUMERIC(12, 2) DEFAULT 0.00,
  status_conta VARCHAR(20) DEFAULT 'ativo' CHECK (status_conta IN ('ativo', 'bloqueado', 'teste')),
  contato_email VARCHAR(255),
  contato_telefone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Se a tabela já existir previamente, adicionar as colunas solicitadas:
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slogan VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plano_valor NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS status_conta VARCHAR(20) DEFAULT 'ativo';

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS RLS (APENAS O SUPER ADMIN / MASTER PODE LER E EDITAR TUDO)
-- Regra: Usuário com role 'admin'/'master' ou app_metadata/user_metadata contendo role = 'master' ou 'admin'.
DROP POLICY IF EXISTS "Super Admin possui acesso irrestrito aos tenants" ON public.tenants;
CREATE POLICY "Super Admin possui acesso irrestrito aos tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin') OR
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin') OR
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
);

-- 4. POLÍTICA DE LEITURA DO PRÓPRIO TENANT (Apenas White-label e Branding para empresa comum)
DROP POLICY IF EXISTS "Empresas podem ler seus proprios dados de white label" ON public.tenants;
CREATE POLICY "Empresas podem ler seus proprios dados de white label"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
);
