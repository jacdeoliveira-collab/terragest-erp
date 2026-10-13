-- ==============================================================================
-- 37_desduplicar_clientes.sql (< 150 linhas)
-- Unifica registros duplicados na tabela clientes, mesclando dados e FKs
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
    id_principal UUID;
    id_duplicado UUID;
BEGIN
    FOR r IN (
        SELECT LOWER(TRIM(nome)) AS nome_norm, COUNT(*) 
        FROM public.clientes 
        WHERE nome IS NOT NULL AND TRIM(nome) <> ''
        GROUP BY LOWER(TRIM(nome)) 
        HAVING COUNT(*) > 1
    ) LOOP
        -- Escolhe como principal o registro que tiver mais dados (endereço/telefone preenchidos sem '-')
        SELECT id INTO id_principal 
        FROM public.clientes 
        WHERE LOWER(TRIM(nome)) = r.nome_norm 
        ORDER BY 
            (endereco IS NOT NULL AND TRIM(endereco) NOT IN ('', '-')) DESC,
            (telefone IS NOT NULL AND TRIM(telefone) NOT IN ('', '-')) DESC,
            created_at ASC 
        LIMIT 1;

        FOR id_duplicado IN (
            SELECT id FROM public.clientes 
            WHERE LOWER(TRIM(nome)) = r.nome_norm AND id <> id_principal
        ) LOOP
            -- Mescla campos que possam estar no duplicado para o registro principal (anulando '-' e vazios)
            UPDATE public.clientes p
            SET 
                telefone = COALESCE(NULLIF(NULLIF(TRIM(p.telefone), '-'), ''), NULLIF(NULLIF(TRIM(d.telefone), '-'), '')),
                documento = COALESCE(NULLIF(NULLIF(TRIM(p.documento), '-'), ''), NULLIF(NULLIF(TRIM(d.documento), '-'), '')),
                endereco = COALESCE(NULLIF(NULLIF(TRIM(p.endereco), '-'), ''), NULLIF(NULLIF(TRIM(d.endereco), '-'), '')),
                email = COALESCE(NULLIF(NULLIF(TRIM(p.email), '-'), ''), NULLIF(NULLIF(TRIM(d.email), '-'), '')),
                updated_at = NOW()
            FROM public.clientes d
            WHERE p.id = id_principal AND d.id = id_duplicado;

            -- Redireciona referências relacionais para o cliente principal
            UPDATE public.servicos_horimetro SET cliente_id = id_principal WHERE cliente_id = id_duplicado;
            UPDATE public.orcamentos SET cliente_id = id_principal WHERE cliente_id = id_duplicado;
            UPDATE public.abastecimentos SET cliente_id = id_principal WHERE cliente_id = id_duplicado;

            -- Remove o cliente duplicado
            DELETE FROM public.clientes WHERE id = id_duplicado;
        END LOOP;
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
