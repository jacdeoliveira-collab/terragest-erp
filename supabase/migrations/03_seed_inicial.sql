-- ==============================================================================
-- TerraGest SaaS - Seed Inicial de Testes
-- Arquivo: 03_seed_inicial.sql
-- Finalidade: Popular o Supabase com dados reais para testes da Sidebar, Header e Dashboard
-- ==============================================================================

-- 1. Criação da tabela 'obras' (caso ainda não exista no Supabase)
CREATE TABLE IF NOT EXISTS obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    nome VARCHAR(150) NOT NULL,
    cliente VARCHAR(150),
    localizacao VARCHAR(200),
    status VARCHAR(30) DEFAULT 'EM_ANDAMENTO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Bloco de Inserção de Dados (Seed)
-- OBS: O tenant_id abaixo '00000000-0000-0000-0000-000000000001' representa
-- a "Construtora TerraGest". Se desejar vincular a um usuário específico,
-- substitua pelo UUID correspondente no Supabase.
-- ==============================================================================

DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_equip_trator UUID := 'a1111111-1111-1111-1111-111111111111';
    v_equip_escavadeira UUID := 'b2222222-2222-2222-2222-222222222222';
    v_equip_gerador UUID := 'c3333333-3333-3333-3333-333333333333';
    v_obra_id UUID := 'd4444444-4444-4444-4444-444444444444';
BEGIN

    -- 1. Permissões de Módulos (Sidebar Master) para a Construtora TerraGest
    INSERT INTO tenant_modulos (tenant_id, modulo_chave, nome_exibicao, icone_chave, ordem, ativo)
    VALUES 
        (v_tenant_id, 'FROTA', 'Frota & Equipamentos', 'truck', 1, true),
        (v_tenant_id, 'BDE', 'Boletins Diários (BDE)', 'file-clock', 2, true),
        (v_tenant_id, 'OBRAS', 'Obras & Terraplanagem', 'hard-hat', 3, true),
        (v_tenant_id, 'RH', 'Operadores & Equipe', 'users', 4, true)
    ON CONFLICT (tenant_id, modulo_chave) 
    DO UPDATE SET ativo = true, nome_exibicao = EXCLUDED.nome_exibicao;

    -- 2. Cadastro da Obra Ativa (Header Dropdown)
    INSERT INTO obras (id, tenant_id, nome, cliente, localizacao, status)
    VALUES (
        v_obra_id,
        v_tenant_id,
        'Terraplanagem Loteamento Sul',
        'Incorporadora Horizonte',
        'Setor Sul - Gleba 4',
        'EM_ANDAMENTO'
    )
    ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

    -- 3. Cadastro de Maquinário Real da Frota
    INSERT INTO equipment (id, code, name, category, type, model, serial_number, current_hourmeter, status)
    VALUES
        (v_equip_trator, 'TRAT-01', 'Trator de Esteira Cat D6T', 'HEAVY_MACHINERY', 'TRATOR', 'Caterpillar D6T', 'CAT00D6TK091', 1248.5, 'IN_OPERATION'),
        (v_equip_escavadeira, 'ESC-02', 'Escavadeira Hidráulica 320D', 'HEAVY_MACHINERY', 'ESCAVADEIRA', 'CAT 320D', 'CAT320D98213', 2410.0, 'IN_OPERATION'),
        (v_equip_gerador, 'GER-01', 'Gerador Trifásico 150kVA', 'HEAVY_MACHINERY', 'GERADOR_TRIFASICO', 'Stemac 150kVA', 'STM150KVA552', 680.0, 'AVAILABLE')
    ON CONFLICT (code) DO UPDATE SET current_hourmeter = EXCLUDED.current_hourmeter, status = EXCLUDED.status;

    -- 4. Boletins Diários de Equipamento (BDE) dos últimos dias (Alimenta o Recharts do Dashboard)
    INSERT INTO daily_bulletins (
        id, equipment_id, date, operator_name, client_name, work_location, 
        initial_hourmeter, final_hourmeter, fuel_liters, service_description, status
    )
    VALUES
        (
            gen_random_uuid(),
            v_equip_trator,
            CURRENT_DATE - INTERVAL '2 day',
            'Carlos Eduardo Santos',
            'Incorporadora Horizonte',
            'Loteamento Sul - Quadra 08',
            1232.5,
            1240.5,
            180.0,
            'Corte e compensação de aterro com lâmina angulável.',
            'APPROVED'
        ),
        (
            gen_random_uuid(),
            v_equip_escavadeira,
            CURRENT_DATE - INTERVAL '1 day',
            'Marcos Roberto Lima',
            'Incorporadora Horizonte',
            'Loteamento Sul - Bacia de Contenção',
            2401.0,
            2410.0,
            210.0,
            'Escavação para conformação do talude e carregamento de basculantes.',
            'APPROVED'
        ),
        (
            gen_random_uuid(),
            v_equip_trator,
            CURRENT_DATE,
            'Carlos Eduardo Santos',
            'Incorporadora Horizonte',
            'Loteamento Sul - Arruamento Principal',
            1240.5,
            1248.5,
            175.0,
            'Espalhamento e nivelamento de subleito na via principal.',
            'SUBMITTED'
        )
    ON CONFLICT DO NOTHING;

END $$;
