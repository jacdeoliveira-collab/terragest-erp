-- =====================================================================
-- LIMPEZA TOTAL DE DADOS - TerraGest ERP  (IRREVERSÍVEL)
-- Apaga todos os dados operacionais, inclusive obras, clientes e funcionários.
-- MANTÉM: auth.users, tenants, tenant_users, tenant_modulos,
--         tenant_integrations, super_admins, catalogo_equipamentos
--         (catálogo de referência) e categorias_custos (configuração).
-- Execute no Supabase SQL Editor. Recomenda-se fazer backup antes.
-- =====================================================================
DO $$
DECLARE
  tabelas text[] := ARRAY[
    'epis_entregues', 'funcionario_documentos', 'equipamento_documentos', 'obra_documentos',
    'abastecimentos', 'almoxarifado_movimentacoes', 'apontamentos_viagens_producao',
    'checklists_diarios', 'planos_manutencao', 'daily_bulletins',
    'contas_pagar', 'contas_receber', 'medicoes',
    'servicos_horimetro', 'orcamentos',
    'equipment', 'rh_funcionarios', 'clientes', 'obras'
  ];
  t text;
  pass int;
  pendentes text[];
BEGIN
  pendentes := tabelas;
  FOR pass IN 1..5 LOOP
    FOREACH t IN ARRAY tabelas LOOP
      IF t = ANY(pendentes) AND to_regclass('public.' || t) IS NOT NULL THEN
        BEGIN
          EXECUTE format('DELETE FROM public.%I', t);
          pendentes := array_remove(pendentes, t);
        EXCEPTION WHEN foreign_key_violation THEN
          NULL; -- tenta novamente na próxima passada
        END;
      ELSIF t = ANY(pendentes) THEN
        pendentes := array_remove(pendentes, t); -- tabela inexistente
      END IF;
    END LOOP;
    EXIT WHEN COALESCE(array_length(pendentes, 1), 0) = 0;
  END LOOP;

  IF COALESCE(array_length(pendentes, 1), 0) > 0 THEN
    RAISE EXCEPTION 'Não foi possível limpar: %', pendentes;
  END IF;
END $$;

-- Conferência: deve retornar 0 em todas as linhas
SELECT 'equipment' AS tabela, count(*) FROM public.equipment
UNION ALL SELECT 'obras', count(*) FROM public.obras
UNION ALL SELECT 'clientes', count(*) FROM public.clientes
UNION ALL SELECT 'rh_funcionarios', count(*) FROM public.rh_funcionarios
UNION ALL SELECT 'contas_pagar', count(*) FROM public.contas_pagar
UNION ALL SELECT 'abastecimentos', count(*) FROM public.abastecimentos;
