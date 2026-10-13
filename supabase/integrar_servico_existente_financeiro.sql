-- ==============================================================================
-- TerraGest SaaS - INTEGRAÇÃO ENTRE SERVIÇO POR HORÍMETRO E MÓDULOS FINANCEIROS
-- Arquivo: supabase/integrar_servico_existente_financeiro.sql
-- ==============================================================================

-- 1. GARANTE A TABELA E TODAS AS COLUNAS EM MEDICOES (CONTAS A RECEBER)
CREATE TABLE IF NOT EXISTS public.medicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    competencia VARCHAR(20) DEFAULT to_char(CURRENT_DATE, 'YYYY-MM'),
    referencia_mes_ano VARCHAR(20) DEFAULT to_char(CURRENT_DATE, 'YYYY-MM'),
    numero_medicao VARCHAR(50),
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    data_pagamento DATE,
    forma_pagamento VARCHAR(50),
    total_horas_produtivas NUMERIC(10, 2) DEFAULT 0.0,
    valor_total NUMERIC(12, 2) DEFAULT 0.0,
    status_pagamento VARCHAR(30) DEFAULT 'AGUARDANDO_PAGAMENTO',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS competencia VARCHAR(20) DEFAULT to_char(CURRENT_DATE, 'YYYY-MM');
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS referencia_mes_ano VARCHAR(20) DEFAULT to_char(CURRENT_DATE, 'YYYY-MM');
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS numero_medicao VARCHAR(50);
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS data_emissao DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days');
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50);
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS total_horas_produtivas NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS valor_total NUMERIC(12, 2) DEFAULT 0.0;
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS status_pagamento VARCHAR(30) DEFAULT 'AGUARDANDO_PAGAMENTO';
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Remove restrições NOT NULL antigas e CHECKs em medicoes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'medicoes' 
          AND column_name NOT IN ('id')
          AND is_nullable = 'NO'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.medicoes ALTER COLUMN ' || quote_ident(r.column_name) || ' DROP NOT NULL;';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;

    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.medicoes'::regclass 
          AND contype = 'c'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.medicoes DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ';';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- 2. GARANTE A TABELA E TODAS AS COLUNAS EM CONTAS_PAGAR
CREATE TABLE IF NOT EXISTS public.contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    descricao VARCHAR(200),
    fornecedor VARCHAR(150),
    categoria VARCHAR(50) DEFAULT 'OUTROS',
    valor NUMERIC(12, 2) DEFAULT 0.00,
    data_vencimento DATE DEFAULT CURRENT_DATE,
    data_pagamento DATE,
    forma_pagamento VARCHAR(50),
    status VARCHAR(30) DEFAULT 'PENDENTE',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL;
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS descricao VARCHAR(200);
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(150);
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'OUTROS';
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS valor NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS data_vencimento DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50);
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PENDENTE';
ALTER TABLE public.contas_pagar ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Remove restrições NOT NULL antigas e CHECKs em contas_pagar (ex: contas_pagar_categoria_check)
ALTER TABLE public.contas_pagar DROP CONSTRAINT IF EXISTS contas_pagar_categoria_check;
ALTER TABLE public.contas_pagar DROP CONSTRAINT IF EXISTS contas_pagar_status_check;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'contas_pagar' 
          AND column_name NOT IN ('id')
          AND is_nullable = 'NO'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.contas_pagar ALTER COLUMN ' || quote_ident(r.column_name) || ' DROP NOT NULL;';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;

    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.contas_pagar'::regclass 
          AND contype = 'c'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.contas_pagar DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ';';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- 3. PERMISSÕES RLS LIBERADAS PARA ACESSO IMEDIATO
ALTER TABLE public.medicoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao Total medicoes" ON public.medicoes;
CREATE POLICY "Permissao Total medicoes" ON public.medicoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao Total contas_pagar" ON public.contas_pagar;
CREATE POLICY "Permissao Total contas_pagar" ON public.contas_pagar FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. SINCRONIZAÇÃO DOS LANÇAMENTOS DO SERVIÇO EXISTENTE
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_obra_id UUID;
    v_eq_id UUID;
    v_serv RECORD;
    v_comp VARCHAR(20);
BEGIN
    SELECT id INTO v_obra_id FROM public.obras WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_eq_id FROM public.equipment WHERE tenant_id = v_tenant_id LIMIT 1;

    FOR v_serv IN SELECT * FROM public.servicos_horimetro WHERE tenant_id = v_tenant_id
    LOOP
        v_comp := to_char(v_serv.data_inicio, 'YYYY-MM');

        -- A) CONTAS A RECEBER (Faturamento Bruto)
        IF v_serv.faturamento_bruto > 0 THEN
            INSERT INTO public.medicoes (
                tenant_id, obra_id, competencia, referencia_mes_ano, numero_medicao, data_emissao,
                data_vencimento, total_horas_produtivas, valor_total, status_pagamento, observacoes
            ) VALUES (
                v_tenant_id,
                v_obra_id,
                v_comp,
                v_comp,
                'HOR-' || UPPER(SUBSTRING(v_serv.id::text FROM 1 FOR 6)),
                v_serv.data_inicio,
                COALESCE(v_serv.data_fim, v_serv.data_inicio + INTERVAL '30 days'),
                v_serv.horas_trabalhadas,
                v_serv.faturamento_bruto,
                'AGUARDANDO_PAGAMENTO',
                'Serviço Horímetro: ' || v_serv.cliente_nome || ' - ' || v_serv.maquina_nome || ' [REF:' || v_serv.id || ']'
            )
            ON CONFLICT DO NOTHING;
        END IF;

        -- B) CONTAS A PAGAR (Combustível & Cupom Fiscal)
        IF COALESCE(v_serv.combustivel_total_valor, 0) > 0 THEN
            INSERT INTO public.contas_pagar (
                tenant_id, obra_id, descricao, fornecedor, categoria,
                valor, data_vencimento, status, observacoes
            ) VALUES (
                v_tenant_id,
                v_obra_id,
                'Combustível Diesel Máq/Apoio - ' || v_serv.maquina_nome,
                'Posto de Combustível / Cupom Fiscal',
                'COMBUSTIVEL',
                v_serv.combustivel_total_valor,
                v_serv.data_inicio,
                'PENDENTE',
                '[REF:' || v_serv.id || '] Cupom Fiscal: ' || COALESCE(v_serv.foto_cupom_combustivel, 'Anexado via Drive') ||
                ' | Máq: ' || COALESCE(v_serv.combustivel_maquina_litros, 0) || 'L (R$ ' || COALESCE(v_serv.combustivel_maquina_valor, 0) || ')' ||
                ' | Apoio: ' || COALESCE(v_serv.combustivel_apoio_litros, 0) || 'L (R$ ' || COALESCE(v_serv.combustivel_apoio_valor, 0) || ')'
            )
            ON CONFLICT DO NOTHING;
        END IF;

        -- C) CONTAS A PAGAR (Diária Operador)
        IF COALESCE(v_serv.despesa_operador, 0) > 0 THEN
            INSERT INTO public.contas_pagar (
                tenant_id, obra_id, descricao, fornecedor, categoria,
                valor, data_vencimento, status, observacoes
            ) VALUES (
                v_tenant_id,
                v_obra_id,
                'Diária Operador - ' || v_serv.operador_nome,
                'Operador ' || v_serv.operador_nome,
                'FOLHA_RH',
                v_serv.despesa_operador,
                v_serv.data_inicio,
                'PENDENTE',
                '[REF:' || v_serv.id || '] Diária operacional da máquina ' || v_serv.maquina_nome
            )
            ON CONFLICT DO NOTHING;
        END IF;

        -- D) ABASTECIMENTO (Frota)
        IF COALESCE(v_serv.combustivel_maquina_litros, 0) > 0 AND v_eq_id IS NOT NULL AND v_obra_id IS NOT NULL THEN
            BEGIN
                INSERT INTO public.abastecimentos (
                    tenant_id, obra_id, maquina_id, data, tipo_combustivel, origem,
                    quantidade_litros, valor_total, horimetro_momento, posto_fornecedor, numero_requisicao_nf
                ) VALUES (
                    v_tenant_id,
                    v_obra_id,
                    v_eq_id,
                    v_serv.data_inicio,
                    'DIESEL_S500',
                    'POSTO',
                    v_serv.combustivel_maquina_litros,
                    COALESCE(v_serv.combustivel_maquina_valor, 0),
                    v_serv.horimetro_inicial,
                    'Posto de Combustível',
                    COALESCE(v_serv.foto_cupom_combustivel, 'Cupom em anexo')
                )
                ON CONFLICT DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END IF;
    END LOOP;
END $$;
