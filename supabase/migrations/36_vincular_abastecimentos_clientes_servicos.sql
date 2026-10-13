-- ==============================================================================
-- 36_vincular_abastecimentos_clientes_servicos.sql (< 150 linhas)
-- 1. Vinculação relacional de abastecimentos a serviços e clientes
-- 2. Garantir coluna abastecimentos_ids em servicos_horimetro
-- 3. Sincronização automática de clientes de servicos_horimetro para a tabela clientes
-- 4. Ajuste de RLS para cobrir tenant padrão
-- ==============================================================================

-- 0. Garantir colunas de auditoria em clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1. Colunas em abastecimentos
ALTER TABLE public.abastecimentos 
    ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.servicos_horimetro(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cliente_nome TEXT;

CREATE INDEX IF NOT EXISTS idx_abastecimentos_servico ON public.abastecimentos(servico_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_cliente ON public.abastecimentos(cliente_id);

-- 2. Coluna abastecimentos_ids em servicos_horimetro
ALTER TABLE public.servicos_horimetro 
    ADD COLUMN IF NOT EXISTS abastecimentos_ids JSONB DEFAULT '[]'::jsonb;

-- 3. Atualizar políticas RLS das tabelas para incluir o tenant padrão
DO $$
DECLARE
    tbl TEXT;
    tabelas TEXT[] := ARRAY[
        'abastecimentos',
        'clientes',
        'contas_pagar',
        'daily_bulletins',
        'equipment',
        'medicoes',
        'obras',
        'orcamentos',
        'rh_funcionarios',
        'servicos_horimetro'
    ];
BEGIN
    FOREACH tbl IN ARRAY tabelas LOOP
        EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I" ON public.%I', tbl, tbl);
        EXECUTE format('
            CREATE POLICY "tenant_isolation_%I" ON public.%I
            FOR ALL TO authenticated
            USING (
                tenant_id = get_current_tenant_id() OR 
                tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid OR 
                tenant_id IS NULL
            )
            WITH CHECK (
                tenant_id = get_current_tenant_id() OR 
                tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid OR 
                tenant_id IS NULL
            )
        ', tbl, tbl);
    END LOOP;
END $$;

-- 4. Sincronizar clientes que existem em servicos_horimetro para a tabela clientes
INSERT INTO public.clientes (id, tenant_id, nome, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    COALESCE(s.tenant_id, '00000000-0000-0000-0000-000000000001'::uuid),
    TRIM(s.cliente_nome),
    MIN(s.created_at),
    NOW()
FROM public.servicos_horimetro s
WHERE s.cliente_nome IS NOT NULL AND TRIM(s.cliente_nome) <> ''
  AND NOT EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE LOWER(TRIM(c.nome)) = LOWER(TRIM(s.cliente_nome))
  )
GROUP BY s.tenant_id, TRIM(s.cliente_nome);

-- 5. Atualizar cliente_id em servicos_horimetro referenciando clientes existentes
UPDATE public.servicos_horimetro s
SET cliente_id = c.id
FROM public.clientes c
WHERE LOWER(TRIM(s.cliente_nome)) = LOWER(TRIM(c.nome))
  AND (s.cliente_id IS NULL OR s.cliente_id <> c.id);

-- 6. Recarregar o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
