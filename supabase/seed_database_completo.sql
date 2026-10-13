-- ==============================================================================
-- TerraGest SaaS - SEED DEFINITIVO E 100% BLINDADO CONTRA COLUNAS FALTANTES
-- Arquivo: seed_database_completo.sql
-- ==============================================================================

-- 1. GARANTIR TODAS AS COLUNAS EM TODAS AS TABELAS EXISTENTES

-- Tabela: tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slogan VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plano_valor NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plano VARCHAR(50) DEFAULT 'ENTERPRISE';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS status_conta VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contato_email VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contato_telefone VARCHAR(50);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS responsavel_tecnico VARCHAR(150);

-- Tabela: rh_funcionarios
ALTER TABLE public.rh_funcionarios ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE public.rh_funcionarios ADD COLUMN IF NOT EXISTS email_acesso VARCHAR(150);
ALTER TABLE public.rh_funcionarios ADD COLUMN IF NOT EXISTS data_admissao DATE;
ALTER TABLE public.rh_funcionarios ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);
ALTER TABLE public.rh_funcionarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(50);
ALTER TABLE public.rh_funcionarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);

-- Tabela: equipment
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS chassi VARCHAR(100);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS renavam VARCHAR(50);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS ano_fabricacao INT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS combustivel_padrao VARCHAR(50);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS potencia_hp NUMERIC(8, 1);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS valor_aquisicao NUMERIC(12, 2);
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS tipo_propriedade VARCHAR(50) DEFAULT 'PROPRIO';
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS current_hourmeter NUMERIC(10, 2) DEFAULT 0.0;

-- Tabela: clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS nome VARCHAR(180);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS documento VARCHAR(30);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS telefone VARCHAR(30);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS email VARCHAR(150);

-- Tabela: obras
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS cliente_nome VARCHAR(200);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS cliente_cnpj VARCHAR(30);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS localizacao VARCHAR(200);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'EM_ANDAMENTO';

-- Tabela: orcamentos
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS descricao_servico TEXT;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS valor_hora NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS horas_estimadas NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS valor_total NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PENDENTE';
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_proposta DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS validade_dias INT DEFAULT 15;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Tabela: servicos_horimetro
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
    foto_horimetro_inicial TEXT,
    foto_horimetro_final TEXT,
    alerta_painel TEXT,
    valor_hora NUMERIC(12, 2) NOT NULL DEFAULT 0,
    horas_trabalhadas NUMERIC(10, 2) NOT NULL DEFAULT 0,
    faturamento_bruto NUMERIC(12, 2) NOT NULL DEFAULT 0,
    combustivel_maquina_litros NUMERIC(10, 2) DEFAULT 0,
    combustivel_maquina_valor NUMERIC(12, 2) DEFAULT 0,
    combustivel_apoio_litros NUMERIC(10, 2) DEFAULT 0,
    combustivel_apoio_valor NUMERIC(12, 2) DEFAULT 0,
    combustivel_total_valor NUMERIC(12, 2) DEFAULT 0,
    foto_cupom_combustivel TEXT,
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

ALTER TABLE public.servicos_horimetro ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao Total servicos_horimetro" ON public.servicos_horimetro;
CREATE POLICY "Permissao Total servicos_horimetro" ON public.servicos_horimetro FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 2. INSERÇÃO DOS DADOS REAIS
-- ==============================================================================

DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_eq_escavadeira UUID := 'e1111111-1111-1111-1111-111111111111';
    v_eq_caminhonete UUID := 'e2222222-2222-2222-2222-222222222222';
    v_eq_trator UUID := 'e3333333-3333-3333-3333-333333333333';
    v_eq_retro UUID := 'e4444444-4444-4444-4444-444444444444';
    v_func_asterio UUID := 'f1111111-1111-1111-1111-111111111111';
    v_func_oliveira UUID := 'f2222222-2222-2222-2222-222222222222';
    v_cliente_boavista UUID := 'c1111111-1111-1111-1111-111111111111';
    v_cliente_horizonte UUID := 'c2222222-2222-2222-2222-222222222222';
    v_obra_drenagem UUID := 'd1111111-1111-1111-1111-111111111111';
    v_obra_loteamento UUID := 'd2222222-2222-2222-2222-222222222222';
    v_orcamento_01 UUID := 'a1111111-1111-1111-1111-111111111111';
    v_orcamento_02 UUID := 'a2222222-2222-2222-2222-222222222222';
    v_servico_id UUID := 'b1111111-1111-1111-1111-111111111111';
BEGIN

    -- Tenant Oficial
    INSERT INTO public.tenants (
        id, nome, cnpj, slogan, contato_email, admin_email, contato_telefone, 
        responsavel_tecnico, status_conta, plano, plano_valor
    ) VALUES (
        v_tenant_id,
        'JAC DE OLIVEIRA - TERRAPLANAGEM',
        '13.533.233/0001-00',
        'Construção Pesada, Drenagem & Terraplanagem Mecanizada',
        'asteriobello@hotmail.com',
        'asteriobello@hotmail.com',
        '(98) 98182-2727',
        'Asterio Bello',
        'ativo',
        'ENTERPRISE',
        1500.00
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        cnpj = EXCLUDED.cnpj,
        slogan = EXCLUDED.slogan,
        status_conta = EXCLUDED.status_conta;

    -- Módulos
    INSERT INTO public.tenant_modulos (tenant_id, modulo_chave, nome_exibicao, icone_chave, ordem, ativo)
    VALUES 
        (v_tenant_id, 'FROTA', 'Frota & Equipamentos', 'truck', 1, true),
        (v_tenant_id, 'COMERCIAL', 'Locação & Horímetro', 'gauge', 2, true),
        (v_tenant_id, 'BDE', 'Boletins Diários (BDE)', 'file-clock', 3, true),
        (v_tenant_id, 'OBRAS', 'Obras & Terraplanagem', 'hard-hat', 4, true),
        (v_tenant_id, 'RH', 'Equipe & Operadores', 'users', 5, true),
        (v_tenant_id, 'FINANCEIRO', 'Financeiro & Custos', 'dollar-sign', 6, true)
    ON CONFLICT (tenant_id, modulo_chave) 
    DO UPDATE SET ativo = true, nome_exibicao = EXCLUDED.nome_exibicao;

    -- Máquinas / Frota
    INSERT INTO public.equipment (
        id, tenant_id, code, name, category, type, model, serial_number, 
        chassi, renavam, ano_fabricacao, current_hourmeter, potencia_hp, 
        combustivel_padrao, valor_aquisicao, tipo_propriedade, status
    ) VALUES 
        (
            v_eq_escavadeira, v_tenant_id, 'ESC-01',
            'Escavadeira Hidráulica New Holland E215C EVO',
            'HEAVY_MACHINERY', 'ESCAVADEIRA', 'E215C EVO', '6306111',
            'HBZN215CVRAA05945', '05945', 2024, 4210.4, 157,
            'DIESEL_S500', 890000.00, 'PROPRIO', 'AVAILABLE'
        ),
        (
            v_eq_caminhonete, v_tenant_id, 'CAM-01',
            'Caminhonete de Apoio Operacional',
            'HEAVY_MACHINERY', 'CAMINHONETE', 'Apoio e Abastecimento', '8AJBA3CD4H1597793',
            '8AJBA3CD4H1597793', '0113155543', 2017, 158420.0, 170,
            'DIESEL_S10', 145000.00, 'PROPRIO', 'AVAILABLE'
        ),
        (
            v_eq_trator, v_tenant_id, 'TRAT-01',
            'Trator de Esteira Caterpillar D6T',
            'HEAVY_MACHINERY', 'TRATOR', 'Caterpillar D6T', 'CAT00D6TK091',
            'CATD6T2021001', '98213', 2021, 2480.0, 205,
            'DIESEL_S500', 950000.00, 'PROPRIO', 'IN_OPERATION'
        ),
        (
            v_eq_retro, v_tenant_id, 'RET-01',
            'Retroescavadeira Case 580N 4x4',
            'HEAVY_MACHINERY', 'RETROESCAVADEIRA', 'Case 580N', 'CAS580N77821',
            '9BF580N2022019', '077821', 2022, 1850.0, 85,
            'DIESEL_S500', 420000.00, 'PROPRIO', 'AVAILABLE'
        )
    ON CONFLICT (code) DO UPDATE SET 
        current_hourmeter = EXCLUDED.current_hourmeter,
        status = EXCLUDED.status,
        name = EXCLUDED.name;

    -- RH / Funcionários
    INSERT INTO public.rh_funcionarios (
        id, tenant_id, nome, cargo, cpf, telefone, email, email_acesso, status, data_admissao
    ) VALUES 
        (
            v_func_asterio, v_tenant_id, 'Asterio Bello',
            'Operador de Escavadeira / Resp. Técnico',
            '000.000.000-01', '(98) 98182-2727', 'asteriobello@hotmail.com', 'asteriobello@hotmail.com',
            'ATIVO', '2022-01-10'
        ),
        (
            v_func_oliveira, v_tenant_id, 'J A C de Oliveira',
            'Diretor Operacional / Encarregado Geral',
            '000.000.000-02', '(98) 98182-2727', 'jacdeoliveira@terragest.com', 'jacdeoliveira@terragest.com',
            'ATIVO', '2021-05-01'
        )
    ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, cargo = EXCLUDED.cargo;

    -- Clientes
    INSERT INTO public.clientes (
        id, tenant_id, nome, documento, telefone, endereco, email
    ) VALUES 
        (
            v_cliente_boavista, v_tenant_id,
            'Fazenda Boa Vista Agropecuária LTDA',
            '13.533.233/0001-00', '(98) 98182-2727',
            'Rodovia MA-014, Km 45 - Zona Rural',
            'contato@fazendaboavista.com.br'
        ),
        (
            v_cliente_horizonte, v_tenant_id,
            'Incorporadora Horizonte Empreendimentos',
            '22.444.888/0001-99', '(98) 3232-1000',
            'Av. dos Holandeses, 1500 - Sala 402',
            'obras@horizonte.com.br'
        )
    ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, documento = EXCLUDED.documento;

    -- Obras
    INSERT INTO public.obras (
        id, tenant_id, nome, cliente, localizacao, status, cliente_nome, cliente_cnpj
    ) VALUES 
        (
            v_obra_drenagem, v_tenant_id,
            'Abertura de Valas e Drenagem Mecanizada',
            'Fazenda Boa Vista', 'Gleba 02 - Setor Agrícola', 'EM_ANDAMENTO',
            'Fazenda Boa Vista Agropecuária LTDA', '13.533.233/0001-00'
        ),
        (
            v_obra_loteamento, v_tenant_id,
            'Terraplanagem e Arruamento Loteamento Sul',
            'Incorporadora Horizonte', 'Setor Sul - Gleba 4', 'EM_ANDAMENTO',
            'Incorporadora Horizonte Empreendimentos', '22.444.888/0001-99'
        )
    ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, status = EXCLUDED.status;

    -- Orçamentos
    INSERT INTO public.orcamentos (
        id, tenant_id, cliente_id, maquina_id, descricao_servico,
        valor_hora, horas_estimadas, valor_total, status, data_proposta, validade_dias, observacoes
    ) VALUES 
        (
            v_orcamento_01, v_tenant_id, v_cliente_boavista, v_eq_escavadeira,
            'Locação de Escavadeira Hidráulica com Operador para Abertura de Valas',
            280.00, 50.0, 14000.00, 'APROVADO',
            CURRENT_DATE - INTERVAL '5 day', 30,
            'Incluso transporte da máquina, operador qualificado e manutenção preventiva.'
        ),
        (
            v_orcamento_02, v_tenant_id, v_cliente_horizonte, v_eq_trator,
            'Corte e Compensação de Aterro com Trator de Esteira D6T',
            350.00, 80.0, 28000.00, 'PENDENTE',
            CURRENT_DATE - INTERVAL '1 day', 15,
            'Medição por horímetro digital com boletim diário (BDE).'
        )
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, valor_total = EXCLUDED.valor_total;

    -- Serviços por Horímetro
    INSERT INTO public.servicos_horimetro (
        id, tenant_id, cliente_id, cliente_nome, cliente_documento, cliente_telefone,
        maquina_id, maquina_nome, operador_id, operador_nome, descricao_servico,
        data_inicio, data_fim, horimetro_inicial, horimetro_final,
        alerta_painel, valor_hora, horas_trabalhadas, faturamento_bruto,
        combustivel_maquina_litros, combustivel_maquina_valor,
        combustivel_apoio_litros, combustivel_apoio_valor, combustivel_total_valor,
        despesa_operador, despesa_apoio, despesa_manutencao, despesas_total,
        lucro_liquido, margem_lucro, status, observacoes
    ) VALUES 
        (
            v_servico_id, v_tenant_id, v_cliente_boavista, 'Fazenda Boa Vista',
            '13.533.233/0001-00', '(98) 98182-2727', v_eq_escavadeira,
            'Escavadeira Hidráulica New Holland E215C EVO (ESC-01)',
            v_func_asterio, 'Asterio Bello',
            'Abertura de valas e terraplenagem mecanizada com escavadeira',
            '2026-10-01', '2026-10-02', 4189.0, 4210.4,
            'Painel 100% Operacional', 280.00, 21.4, 5992.00,
            300.01, 2124.07, 57.73, 420.27, 2544.34,
            300.00, 150.00, 0.00, 2994.34, 2997.66, 50.0,
            'FINALIZADO', 'Serviço concluído com medição de horímetro e diesel comprovados.'
        )
    ON CONFLICT (id) DO UPDATE SET 
        horimetro_final = EXCLUDED.horimetro_final,
        lucro_liquido = EXCLUDED.lucro_liquido;

END $$;
