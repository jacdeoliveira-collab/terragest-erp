-- ==============================================================================
-- TerraGest SaaS - Migração 12: Convite Universal de Usuários e Triggers RLS
-- Arquivo: 12_invite_triggers_rls.sql (< 150 linhas)
-- ==============================================================================

-- 1. Trigger universal para injeção automática de tenant_id (BEFORE INSERT)
CREATE OR REPLACE FUNCTION set_current_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := get_current_tenant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar Trigger nas tabelas operacionais do sistema
DROP TRIGGER IF EXISTS trg_set_tenant_equipment ON equipment;
CREATE TRIGGER trg_set_tenant_equipment
    BEFORE INSERT ON equipment
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_daily_bulletins ON daily_bulletins;
CREATE TRIGGER trg_set_tenant_daily_bulletins
    BEFORE INSERT ON daily_bulletins
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_rh_funcionarios ON rh_funcionarios;
CREATE TRIGGER trg_set_tenant_rh_funcionarios
    BEFORE INSERT ON rh_funcionarios
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_epis_entregues ON epis_entregues;
CREATE TRIGGER trg_set_tenant_epis_entregues
    BEFORE INSERT ON epis_entregues
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_abastecimentos ON abastecimentos;
CREATE TRIGGER trg_set_tenant_abastecimentos
    BEFORE INSERT ON abastecimentos
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_planos_manutencao ON planos_manutencao;
CREATE TRIGGER trg_set_tenant_planos_manutencao
    BEFORE INSERT ON planos_manutencao
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

DROP TRIGGER IF EXISTS trg_set_tenant_checklists_diarios ON checklists_diarios;
CREATE TRIGGER trg_set_tenant_checklists_diarios
    BEFORE INSERT ON checklists_diarios
    FOR EACH ROW EXECUTE FUNCTION set_current_tenant_id();

-- 2. Função RPC invite_user_to_tenant
CREATE OR REPLACE FUNCTION invite_user_to_tenant(
    p_email TEXT,
    p_role TEXT,
    p_target_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    
    IF v_clean_email IS NULL OR v_clean_email = '' OR v_clean_email NOT LIKE '%@%' THEN
        RETURN jsonb_build_object('success', false, 'error', 'E-mail inválido.');
    END IF;

    -- Se for role operador, atualizar status no RH correspondente
    IF p_role = 'operador' THEN
        UPDATE rh_funcionarios
        SET email_acesso = v_clean_email,
            status_convite = 'PENDENTE',
            tenant_id = COALESCE(tenant_id, p_target_tenant_id),
            updated_at = NOW()
        WHERE (LOWER(TRIM(email_acesso)) = v_clean_email OR tenant_id = p_target_tenant_id)
          AND (email_acesso = v_clean_email OR id = p_target_tenant_id);
    END IF;

    -- Se for role admin, atualizar tabela tenants
    IF p_role = 'admin' AND p_target_tenant_id IS NOT NULL THEN
        UPDATE tenants
        SET admin_email = v_clean_email,
            updated_at = NOW()
        WHERE id = p_target_tenant_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite gerado com sucesso para ' || v_clean_email,
        'email', v_clean_email,
        'role', p_role,
        'tenant_id', p_target_tenant_id
    );
END;
$$;
