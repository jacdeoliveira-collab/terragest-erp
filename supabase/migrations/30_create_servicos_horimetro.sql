-- ==============================================================================
-- TerraGest SaaS - Tabela de Serviços por Horímetro (Locação e Medição de Campo)
-- Arquivo: 30_create_servicos_horimetro.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.servicos_horimetro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    cliente_id UUID,
    cliente_nome TEXT NOT NULL,
    cliente_documento TEXT,
    cliente_telefone TEXT,
    maquina_id UUID,
    maquina_nome TEXT NOT NULL,
    operador_id UUID,
    operador_nome TEXT NOT NULL,
    descricao_servico TEXT NOT NULL,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE,
    horimetro_inicial NUMERIC(10, 2) NOT NULL DEFAULT 0,
    horimetro_final NUMERIC(10, 2),
    foto_horimetro_inicial TEXT, -- URL pública / webViewLink do Google Drive
    foto_horimetro_final TEXT,   -- URL pública / webViewLink do Google Drive
    alerta_painel TEXT,
    valor_hora NUMERIC(12, 2) NOT NULL DEFAULT 0,
    horas_trabalhadas NUMERIC(10, 2) NOT NULL DEFAULT 0,
    faturamento_bruto NUMERIC(12, 2) NOT NULL DEFAULT 0,
    combustivel_maquina_litros NUMERIC(10, 2) DEFAULT 0,
    combustivel_maquina_valor NUMERIC(12, 2) DEFAULT 0,
    combustivel_apoio_litros NUMERIC(10, 2) DEFAULT 0,
    combustivel_apoio_valor NUMERIC(12, 2) DEFAULT 0,
    combustivel_total_valor NUMERIC(12, 2) DEFAULT 0,
    foto_cupom_combustivel TEXT, -- URL pública / webViewLink do Google Drive
    despesa_operador NUMERIC(12, 2) DEFAULT 0,
    despesa_apoio NUMERIC(12, 2) DEFAULT 0,
    despesa_manutencao NUMERIC(12, 2) DEFAULT 0,
    despesas_total NUMERIC(12, 2) DEFAULT 0,
    lucro_liquido NUMERIC(12, 2) DEFAULT 0,
    margem_lucro NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'EM_ANDAMENTO',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_servicos_horimetro_tenant ON public.servicos_horimetro(tenant_id);
CREATE INDEX IF NOT EXISTS idx_servicos_horimetro_status ON public.servicos_horimetro(status);
CREATE INDEX IF NOT EXISTS idx_servicos_horimetro_created ON public.servicos_horimetro(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.servicos_horimetro ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Usuários autenticados acessam serviços de seu tenant" ON public.servicos_horimetro;
CREATE POLICY "Usuários autenticados acessam serviços de seu tenant"
ON public.servicos_horimetro
FOR ALL
TO authenticated
USING (
    tenant_id IS NULL OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
)
WITH CHECK (
    tenant_id IS NULL OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'superadmin')
);

-- Garantir acesso para a role anon durante desenvolvimento
DROP POLICY IF EXISTS "Acesso público servicos_horimetro" ON public.servicos_horimetro;
CREATE POLICY "Acesso público servicos_horimetro"
ON public.servicos_horimetro
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
