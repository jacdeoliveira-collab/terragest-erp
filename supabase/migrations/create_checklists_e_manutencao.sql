-- ==============================================================================
-- TerraGest SaaS - Módulo de Manutenção Preventiva e Checklists Diários
-- Arquivo: create_checklists_e_manutencao.sql (< 150 linhas)
-- ==============================================================================

-- 1. Tabela de Checklists Diários (Inspeções Pré-Operacionais)
CREATE TABLE IF NOT EXISTS public.checklists_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    maquina_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    operador_id UUID REFERENCES public.rh_funcionarios(id) ON DELETE SET NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    horimetro_atual NUMERIC(10, 2),
    nivel_oleo BOOLEAN DEFAULT TRUE,
    nivel_oleo_ok BOOLEAN DEFAULT TRUE,
    vazamentos BOOLEAN DEFAULT FALSE,
    vazamentos_ok BOOLEAN DEFAULT TRUE,
    nivel_arrefecimento_ok BOOLEAN DEFAULT TRUE,
    freios_comandos_ok BOOLEAN DEFAULT TRUE,
    pneus_esteiras_ok BOOLEAN DEFAULT TRUE,
    iluminacao_alarme_ok BOOLEAN DEFAULT TRUE,
    status_geral VARCHAR(50) DEFAULT 'APROVADO',
    status_geral_aprovado BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Planos de Manutenção Preventiva
CREATE TABLE IF NOT EXISTS public.planos_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    maquina_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    tipo_servico VARCHAR(150),
    tipo_servico_nome VARCHAR(150),
    servico VARCHAR(150),
    intervalo_horas NUMERIC(10, 2) DEFAULT 250,
    ultimo_horimetro NUMERIC(10, 2) DEFAULT 0,
    ultimo_horimetro_realizado NUMERIC(10, 2) DEFAULT 0,
    horimetro_proxima_troca NUMERIC(10, 2),
    data_ultima_execucao DATE DEFAULT CURRENT_DATE,
    responsavel_mecanico VARCHAR(150),
    mecanico_id UUID REFERENCES public.rh_funcionarios(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'REALIZADO', 'EM_DIA', 'PROXIMO_VENCIMENTO', 'ATRASADO')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_checklists_diarios_tenant ON public.checklists_diarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_checklists_diarios_maquina ON public.checklists_diarios(maquina_id);
CREATE INDEX IF NOT EXISTS idx_planos_manutencao_tenant ON public.planos_manutencao(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planos_manutencao_maquina ON public.planos_manutencao(maquina_id);

-- 4. Habilitação de RLS (Row Level Security)
ALTER TABLE public.checklists_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_manutencao ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Isolamento por Tenant
DROP POLICY IF EXISTS "tenant_isolation_checklists_diarios_all" ON public.checklists_diarios;
CREATE POLICY "tenant_isolation_checklists_diarios_all" ON public.checklists_diarios
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "tenant_isolation_planos_manutencao_all" ON public.planos_manutencao;
CREATE POLICY "tenant_isolation_planos_manutencao_all" ON public.planos_manutencao
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
    WITH CHECK (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

-- 6. Gatilhos de Injeção Automática de Tenant ID (BEFORE INSERT)
DROP TRIGGER IF EXISTS trg_set_tenant_checklists_diarios ON public.checklists_diarios;
CREATE TRIGGER trg_set_tenant_checklists_diarios
    BEFORE INSERT ON public.checklists_diarios
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_planos_manutencao ON public.planos_manutencao;
CREATE TRIGGER trg_set_tenant_planos_manutencao
    BEFORE INSERT ON public.planos_manutencao
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_tenant_id();
