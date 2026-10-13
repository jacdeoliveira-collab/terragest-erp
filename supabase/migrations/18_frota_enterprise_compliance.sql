-- ==============================================================================
-- TerraGest SaaS - Módulo Frota: Expansão Enterprise (Patrimônio, NR-12 & Telemetria)
-- Arquivo: 18_frota_enterprise_compliance.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE public.equipment
    ADD COLUMN IF NOT EXISTS placa VARCHAR(10),
    ADD COLUMN IF NOT EXISTS tipo_propriedade VARCHAR(30) DEFAULT 'PROPRIO',
    ADD COLUMN IF NOT EXISTS fornecedor_locacao VARCHAR(150),
    ADD COLUMN IF NOT EXISTS valor_locacao_mensal NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS valor_aquisicao NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS custo_hora_estimado NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS laudo_art_validade DATE,
    ADD COLUMN IF NOT EXISTS seguro_apolice VARCHAR(60),
    ADD COLUMN IF NOT EXISTS seguro_validade DATE,
    ADD COLUMN IF NOT EXISTS tag_rastreador VARCHAR(60),
    ADD COLUMN IF NOT EXISTS combustivel_padrao VARCHAR(30) DEFAULT 'DIESEL_S10',
    ADD COLUMN IF NOT EXISTS capacidade_tanque NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS potencia_hp NUMERIC(8, 1);

CREATE INDEX IF NOT EXISTS idx_equipment_placa ON public.equipment(placa);
CREATE INDEX IF NOT EXISTS idx_equipment_tipo_propriedade ON public.equipment(tipo_propriedade);
CREATE INDEX IF NOT EXISTS idx_equipment_laudo_art_validade ON public.equipment(laudo_art_validade);
CREATE INDEX IF NOT EXISTS idx_equipment_seguro_validade ON public.equipment(seguro_validade);

COMMENT ON COLUMN public.equipment.placa IS 'Placa do veículo / caminhão no padrão Mercosul/Brasil';
COMMENT ON COLUMN public.equipment.tipo_propriedade IS 'Regime de posse: PROPRIO ou LOCADO';
COMMENT ON COLUMN public.equipment.fornecedor_locacao IS 'Empresa locadora responsável (se locado)';
COMMENT ON COLUMN public.equipment.valor_locacao_mensal IS 'Valor do aluguel mensal cobrado pelo equipamento';
COMMENT ON COLUMN public.equipment.custo_hora_estimado IS 'Custo horário de referência para apropriação operacional (R$/h)';
COMMENT ON COLUMN public.equipment.laudo_art_validade IS 'Validade do Laudo Mecânico / ART de Estabilidade (NR-12/NR-18)';
COMMENT ON COLUMN public.equipment.seguro_apolice IS 'Número da apólice de seguro do maquinário';
COMMENT ON COLUMN public.equipment.seguro_validade IS 'Data de vencimento do seguro';
COMMENT ON COLUMN public.equipment.tag_rastreador IS 'Código do rastreador / módulo de telemetria GPS';
COMMENT ON COLUMN public.equipment.combustivel_padrao IS 'Tipo de combustível principal utilizado (DIESEL_S10, etc)';
COMMENT ON COLUMN public.equipment.capacidade_tanque IS 'Capacidade total do tanque de combustível em litros';
COMMENT ON COLUMN public.equipment.potencia_hp IS 'Potência nominal do motor em cavalos-vapor (HP)';
