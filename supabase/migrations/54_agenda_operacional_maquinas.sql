-- ==============================================================================
-- TerraGest ERP - Migração 54: Agenda & Fila Operacional de Máquinas
-- ==============================================================================

-- 1. Parâmetros operacionais dinâmicos por empresa (sem hardcode)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS parametros_operacionais JSONB DEFAULT '{}'::jsonb;

-- 2. Tabela da Fila Operacional / Agendamento de Máquinas
CREATE TABLE IF NOT EXISTS public.agenda_operacional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  maquina_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  maquina_nome VARCHAR(200),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome VARCHAR(200) NOT NULL,
  cliente_telefone VARCHAR(40),
  endereco_servico TEXT,
  distancia_km NUMERIC(10, 2) DEFAULT 0,
  precisa_prancha BOOLEAN DEFAULT false,
  horas_estimadas NUMERIC(10, 2) NOT NULL DEFAULT 8,
  ordem_fila INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(30) DEFAULT 'AGUARDANDO',
  data_inicio_prevista DATE,
  data_fim_prevista DATE,
  observacoes TEXT,
  ultimo_contato_whatsapp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agenda_operacional_tenant_maquina
  ON public.agenda_operacional(tenant_id, maquina_id, ordem_fila);

-- 3. RLS Multi-Tenant
ALTER TABLE public.agenda_operacional ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_operacional_tenant_policy" ON public.agenda_operacional;
CREATE POLICY "agenda_operacional_tenant_policy" ON public.agenda_operacional
  FOR ALL TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.agenda_operacional.tenant_id
        AND tu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.tenant_id = public.agenda_operacional.tenant_id
        AND tu.user_id = auth.uid()
    )
  );

