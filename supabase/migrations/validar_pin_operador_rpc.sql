-- ==============================================================================
-- TerraGest SaaS - Segurança de Sigilo: Validação de PIN de Assinatura
-- ==============================================================================

-- Função RPC com SECURITY DEFINER para verificar o PIN de 4 dígitos sem expor a coluna publicamente
CREATE OR REPLACE FUNCTION public.validar_pin_operador(
    p_funcionario_id UUID,
    p_pin VARCHAR(4)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stored_pin VARCHAR(4);
BEGIN
    SELECT pin_assinatura INTO v_stored_pin
    FROM public.rh_funcionarios
    WHERE id = p_funcionario_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Se o operador ainda não tem PIN cadastrado, permite validação inicial
    IF v_stored_pin IS NULL OR TRIM(v_stored_pin) = '' THEN
        RETURN TRUE;
    END IF;

    RETURN (v_stored_pin = TRIM(p_pin));
END;
$$;

REVOKE ALL ON FUNCTION public.validar_pin_operador(UUID, VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validar_pin_operador(UUID, VARCHAR) TO authenticated;
