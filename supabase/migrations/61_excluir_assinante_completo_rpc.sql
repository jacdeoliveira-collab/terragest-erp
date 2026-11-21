-- ==============================================================================
-- TerraGest ERP - Migração 61: RPC excluir_assinante_completo (Painel Master)
-- Remove completamente um assinante (tenant) e TODOS os dados vinculados
-- em todas as tabelas do schema public + usuários exclusivos em auth.users
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.excluir_assinante_completo(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_master BOOLEAN;
  v_exists BOOLEAN;
  v_exclusive_users UUID[];
  v_table RECORD;
  v_pass INT;
  v_pending INT;
  v_tabelas_limpas INT := 0;
  v_usuarios_removidos INT := 0;
  v_rows INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado.');
  END IF;

  SELECT (
    EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('master', 'superadmin')
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'is_master', '') = 'true'
    OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'is_super_admin', '') = 'true'
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('master', 'superadmin')
  ) INTO v_is_master;

  IF NOT v_is_master THEN
    RETURN jsonb_build_object('success', false, 'error', 'Acesso negado: apenas Super Admin (Master) pode excluir assinantes.');
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.tenants WHERE id = p_tenant_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Assinante não encontrado.');
  END IF;

  -- Identifica usuários exclusivos deste tenant (preserva Master e usuários vinculados a outras empresas)
  SELECT COALESCE(ARRAY_AGG(DISTINCT tu.user_id), ARRAY[]::UUID[])
  INTO v_exclusive_users
  FROM public.tenant_users tu
  WHERE tu.tenant_id = p_tenant_id
    AND tu.user_id <> auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.super_admins sa WHERE sa.id = tu.user_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.tenant_users tu2
      WHERE tu2.user_id = tu.user_id AND tu2.tenant_id <> p_tenant_id
    );

  -- Limpa dinamicamente TODAS as tabelas do schema public que possuem coluna tenant_id
  -- Executa múltiplas passadas para respeitar chaves estrangeiras (filhas antes das pais)
  FOR v_pass IN 1..6 LOOP
    v_pending := 0;
    FOR v_table IN
      SELECT c.table_name
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND c.column_name = 'tenant_id'
        AND t.table_type = 'BASE TABLE'
        AND c.table_name <> 'tenants'
      ORDER BY c.table_name
    LOOP
      BEGIN
        EXECUTE format('DELETE FROM public.%I WHERE tenant_id = $1', v_table.table_name)
        USING p_tenant_id;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        IF v_rows > 0 THEN
          v_tabelas_limpas := v_tabelas_limpas + 1;
        END IF;
      EXCEPTION WHEN foreign_key_violation THEN
        v_pending := v_pending + 1;
      END;
    END LOOP;
    EXIT WHEN v_pending = 0;
  END LOOP;

  -- Remove a própria empresa da tabela tenants
  DELETE FROM public.tenants WHERE id = p_tenant_id;

  -- Remove contas de autenticação exclusivas deste assinante
  IF array_length(v_exclusive_users, 1) IS NOT NULL THEN
    DELETE FROM auth.identities WHERE user_id = ANY(v_exclusive_users);
    DELETE FROM auth.users WHERE id = ANY(v_exclusive_users);
    GET DIAGNOSTICS v_usuarios_removidos = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'tabelas_limpas', v_tabelas_limpas,
    'usuarios_removidos', v_usuarios_removidos
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.excluir_assinante_completo(UUID) TO authenticated;
