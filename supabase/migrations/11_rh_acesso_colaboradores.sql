-- ==============================================================================
-- TerraGest SaaS - Migração 11: Acesso de Colaboradores e Convite por E-mail
-- Arquivo: 11_rh_acesso_colaboradores.sql (< 150 linhas)
-- ==============================================================================

-- 1. Adicionar colunas de controle de acesso na tabela rh_funcionarios
ALTER TABLE rh_funcionarios 
    ADD COLUMN IF NOT EXISTS email_acesso VARCHAR(150),
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status_convite VARCHAR(30) DEFAULT 'NAO_CONVIDADO';

-- Constraint de status do convite
DO $$
BEGIN
    ALTER TABLE rh_funcionarios DROP CONSTRAINT IF EXISTS rh_funcionarios_status_convite_check;
    ALTER TABLE rh_funcionarios ADD CONSTRAINT rh_funcionarios_status_convite_check 
        CHECK (status_convite IN ('NAO_CONVIDADO', 'PENDENTE', 'ATIVO'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_email_acesso ON rh_funcionarios(email_acesso);
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_auth_user_id ON rh_funcionarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_status_convite ON rh_funcionarios(status_convite);

-- 2. Função RPC segura para registrar envio de convite e vincular tenant
CREATE OR REPLACE FUNCTION convidar_colaborador_rh(
    p_funcionario_id UUID,
    p_email VARCHAR(150)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_funcionario_nome VARCHAR(150);
BEGIN
    -- Validar e obter dados do funcionário
    SELECT tenant_id, nome INTO v_tenant_id, v_funcionario_nome
    FROM rh_funcionarios
    WHERE id = p_funcionario_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Colaborador não encontrado.');
    END IF;

    -- Atualizar o funcionário com o e-mail de acesso e marcar status como PENDENTE
    UPDATE rh_funcionarios
    SET email_acesso = LOWER(TRIM(p_email)),
        status_convite = 'PENDENTE',
        updated_at = NOW()
    WHERE id = p_funcionario_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite registrado com sucesso.',
        'tenant_id', v_tenant_id,
        'email', LOWER(TRIM(p_email)),
        'nome', v_funcionario_nome
    );
END;
$$;
