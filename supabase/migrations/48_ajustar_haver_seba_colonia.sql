-- Migration 48: Ajustar histórico de havers e recebimentos de SEBA DA COLÔNIA (< 150 linhas)
UPDATE public.servicos_horimetro
SET 
  valor_adiantamento = 8000.00,
  saldo_restante = GREATEST(0, faturamento_bruto - 8000.00),
  status_pagamento_cliente = CASE WHEN faturamento_bruto <= 8000.00 THEN 'QUITADO' ELSE 'PARCIAL' END,
  adiantamentos_historico = jsonb_build_array(
    jsonb_build_object(
      'id', 'ad_seba_1',
      'valor', 4000.00,
      'data', COALESCE(data_adiantamento, data_inicio, '2026-10-07'),
      'forma_pagamento', COALESCE(forma_pagamento_adiantamento, 'PIX'),
      'observacao', '1º Haver / Sinal Inicial'
    ),
    jsonb_build_object(
      'id', 'ad_seba_2',
      'valor', 4000.00,
      'data', '2026-10-09',
      'forma_pagamento', 'PIX',
      'observacao', '2º Haver recebido'
    )
  ),
  updated_at = NOW()
WHERE cliente_nome ILIKE '%SEBA%';
