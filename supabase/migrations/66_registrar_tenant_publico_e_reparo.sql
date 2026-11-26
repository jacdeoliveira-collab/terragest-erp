-- ==============================================================================
-- TerraGest ERP - Migração 66: Registro público seguro de empresa (tenant)
-- Corrige cadastros que criavam usuário + assinatura Asaas mas NÃO criavam a
-- linha em public.tenants (a coluna "documento" não existe em tenants e o
-- insert direto do navegador falhava silenciosamente).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.registrar_tenant_publico(
  p_user_id UUID,
  p_nome TEXT,
  p_cnpj TEXT,
  p_email TEXT,
  p_telefone TEXT,
  p_endereco TEXT,
  p_plano TEXT,
  p_valor NUMERIC,
  p_limite_usuarios INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Usuário de autenticação não encontrado.');
  END IF;

  INSERT INTO public.tenants (
    id, nome, cnpj, admin_email, contato_email, contato_telefone, endereco,
    plano, status_conta, assinatura_inicio, assinatura_fim,
    limite_usuarios, valor_mensalidade, plano_valor
  ) VALUES (
    p_user_id, p_nome, p_cnpj, lower(p_email), lower(p_email), p_telefone, p_endereco,
    upper(p_plano), 'ativo', CURRENT_DATE, (CURRENT_DATE + INTERVAL '30 days')::date,
    COALESCE(p_limite_usuarios, 5), p_valor, p_valor
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome, cnpj = EXCLUDED.cnpj, admin_email = EXCLUDED.admin_email,
    contato_email = EXCLUDED.contato_email, contato_telefone = EXCLUDED.contato_telefone,
    endereco = EXCLUDED.endereco, plano = EXCLUDED.plano,
    limite_usuarios = EXCLUDED.limite_usuarios,
    valor_mensalidade = EXCLUDED.valor_mensalidade, plano_valor = EXCLUDED.plano_valor;

  INSERT INTO public.tenant_users (tenant_id, user_id, role, perfil_acesso)
  VALUES (p_user_id, p_user_id, 'admin', 'ADMIN')
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'admin', perfil_acesso = 'ADMIN';

  RETURN jsonb_build_object('ok', true, 'tenant_id', p_user_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_tenant_publico(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, INT) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- REPARO: cria a empresa que já se cadastrou (consultoriaagrocodo@gmail.com)
-- e já possui assinatura ativa no Asaas (sub_6lurrzuhe83a7e5z)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_uid UUID;
  v_nome TEXT;
BEGIN
  SELECT id, COALESCE(raw_user_meta_data->>'empresa', raw_user_meta_data->>'nome', email)
    INTO v_uid, v_nome
  FROM auth.users
  WHERE lower(email) = 'consultoriaagrocodo@gmail.com'
  LIMIT 1;

  IF v_uid IS NOT NULL THEN
    PERFORM public.registrar_tenant_publico(
      v_uid, v_nome, NULL, 'consultoriaagrocodo@gmail.com', NULL, NULL, 'COMPLETO', 6.00, 50
    );
    UPDATE public.tenants
    SET asaas_customer_id = 'cus_000219976064',
        asaas_subscription_id = 'sub_6lurrzuhe83a7e5z',
        asaas_subscription_status = 'ACTIVE'
    WHERE id = v_uid;
  END IF;
END $$;
