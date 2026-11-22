-- ==============================================================================
-- TerraGest ERP - Migração 62: Recalcula combustível real dos serviços por
-- horímetro a partir de public.abastecimentos (elimina valores duplicados)
-- ==============================================================================

WITH reais AS (
  SELECT
    s.id AS servico_id,
    COALESCE(SUM(CASE WHEN a.numero_requisicao_nf ILIKE '%APOIO%' OR a.maquina_id = '021f824a-4f94-4d4a-9f5c-97a6cc8bf0ee'::uuid THEN 0 ELSE a.quantidade_litros END), 0) AS maq_l,
    COALESCE(SUM(CASE WHEN a.numero_requisicao_nf ILIKE '%APOIO%' OR a.maquina_id = '021f824a-4f94-4d4a-9f5c-97a6cc8bf0ee'::uuid THEN 0 ELSE a.valor_total END), 0) AS maq_v,
    COALESCE(SUM(CASE WHEN a.numero_requisicao_nf ILIKE '%APOIO%' OR a.maquina_id = '021f824a-4f94-4d4a-9f5c-97a6cc8bf0ee'::uuid THEN a.quantidade_litros ELSE 0 END), 0) AS apoio_l,
    COALESCE(SUM(CASE WHEN a.numero_requisicao_nf ILIKE '%APOIO%' OR a.maquina_id = '021f824a-4f94-4d4a-9f5c-97a6cc8bf0ee'::uuid THEN a.valor_total ELSE 0 END), 0) AS apoio_v,
    COALESCE(SUM(a.valor_total), 0) AS total_v,
    COALESCE(jsonb_agg(a.id) FILTER (WHERE a.id IS NOT NULL), '[]'::jsonb) AS ids_json
  FROM public.servicos_horimetro s
  LEFT JOIN public.abastecimentos a ON a.servico_id = s.id
  GROUP BY s.id
)
UPDATE public.servicos_horimetro s
SET
  combustivel_maquina_litros = ROUND(r.maq_l::numeric, 2),
  combustivel_maquina_valor  = ROUND(r.maq_v::numeric, 2),
  combustivel_apoio_litros   = ROUND(r.apoio_l::numeric, 2),
  combustivel_apoio_valor    = ROUND(r.apoio_v::numeric, 2),
  combustivel_total_valor    = ROUND(r.total_v::numeric, 2),
  abastecimentos_ids         = r.ids_json,
  despesas_total             = ROUND((r.total_v + COALESCE(s.despesa_operador, 0) + COALESCE(s.despesa_apoio, 0) + COALESCE(s.despesa_manutencao, 0))::numeric, 2),
  lucro_liquido              = ROUND((COALESCE(s.faturamento_bruto, 0) - (r.total_v + COALESCE(s.despesa_operador, 0) + COALESCE(s.despesa_apoio, 0) + COALESCE(s.despesa_manutencao, 0)))::numeric, 2),
  margem_lucro               = CASE WHEN COALESCE(s.faturamento_bruto, 0) > 0
                                 THEN ROUND(((COALESCE(s.faturamento_bruto, 0) - (r.total_v + COALESCE(s.despesa_operador, 0) + COALESCE(s.despesa_apoio, 0) + COALESCE(s.despesa_manutencao, 0))) / s.faturamento_bruto * 100)::numeric, 1)
                                 ELSE 0 END,
  updated_at                 = NOW()
FROM reais r
WHERE s.id = r.servico_id
  AND ABS(COALESCE(s.combustivel_total_valor, 0) - r.total_v) > 0.01;
