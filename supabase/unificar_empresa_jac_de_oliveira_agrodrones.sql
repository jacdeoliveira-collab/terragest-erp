-- ==============================================================================
-- TerraGest SaaS - UNIFICAÇÃO DEFINITIVA DA EMPRESA JAC DE OLIVEIRA / AGRODRONES
-- Arquivo: supabase/unificar_empresa_jac_de_oliveira_agrodrones.sql
-- ==============================================================================

DO $$
DECLARE
    v_target_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_tbl TEXT;
    v_tabelas TEXT[] := ARRAY[
        'equipment', 'obras', 'orcamentos', 'rh_funcionarios', 'clientes',
        'servicos_horimetro', 'daily_bulletins', 'abastecimentos', 'contas_pagar',
        'medicoes', 'almoxarifado_itens', 'checklists_preventivos', 'obra_documentos',
        'equipamento_documentos', 'funcionario_documentos', 'sipeagro_reports'
    ];
BEGIN
    -- 1. Garante que o Tenant Oficial JAC DE OLIVEIRA / AGRODRONES existe
    INSERT INTO public.tenants (
        id, nome, razao_social, cnpj, slogan, contato_email, admin_email,
        contato_telefone, responsavel_tecnico, status_conta, plano, plano_valor
    ) VALUES (
        v_target_tenant_id,
        'JAC DE OLIVEIRA',
        'JAC DE OLIVEIRA / AGRODRONES',
        '13.533.233/0001-00',
        'Drones Agrícolas, Georreferenciamento & Gestão Rural',
        'jacdeoliveira@outlook.com.br',
        'jacdeoliveira@outlook.com.br',
        '(98) 98182-2727',
        'J A C de Oliveira',
        'ativo',
        'ENTERPRISE',
        1500.00
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = 'JAC DE OLIVEIRA',
        razao_social = 'JAC DE OLIVEIRA / AGRODRONES',
        slogan = 'Drones Agrícolas, Georreferenciamento & Gestão Rural',
        contato_email = 'jacdeoliveira@outlook.com.br',
        admin_email = 'jacdeoliveira@outlook.com.br',
        status_conta = 'ativo';

    -- 2. Transfere TODOS os dados de forma defensiva (somente tabelas que realmente existem)
    FOREACH v_tbl IN ARRAY v_tabelas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = v_tbl) THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = v_tbl AND column_name = 'tenant_id') THEN
                EXECUTE format('UPDATE public.%I SET tenant_id = %L', v_tbl, v_target_tenant_id);
            END IF;
        END IF;
    END LOOP;

    -- 3. Remove quaisquer outras empresas cadastradas
    DELETE FROM public.tenant_users WHERE tenant_id != v_target_tenant_id;
    DELETE FROM public.tenants WHERE id != v_target_tenant_id;

    -- 4. Vincula todos os usuários autenticados à empresa JAC DE OLIVEIRA como ADMIN
    INSERT INTO public.tenant_users (tenant_id, user_id, role, perfil_acesso)
    SELECT v_target_tenant_id, id, 'admin', 'ADMIN'
    FROM auth.users
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'admin', perfil_acesso = 'ADMIN';

    -- 5. Atualiza os metadados do JWT de todos os usuários com o tenant oficial
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('tenant_id', v_target_tenant_id, 'perfil_acesso', 'ADMIN', 'role', 'admin'),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('tenant_id', v_target_tenant_id, 'perfil_acesso', 'ADMIN', 'role', 'admin');

    -- 6. Liberação dinâmica de RLS para todas as tabelas operacionais
    FOREACH v_tbl IN ARRAY ARRAY[
        'obras', 'equipment', 'rh_funcionarios', 'clientes', 'orcamentos',
        'servicos_horimetro', 'daily_bulletins', 'abastecimentos', 'contas_pagar',
        'medicoes', 'tenants', 'tenant_users'
    ]
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = v_tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_tbl);
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I_all" ON public.%I', v_tbl, v_tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Permissao Total %I" ON public.%I', v_tbl, v_tbl);
            EXECUTE format('CREATE POLICY "Permissao Total %I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', v_tbl, v_tbl);
        END IF;
    END LOOP;

END $$;

-- 7. Função get_current_tenant_id() com retorno padrão garantido
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid,
        NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '')::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
