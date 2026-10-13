-- ==============================================================================
-- TerraGest SaaS - Catálogo Global de Equipamentos (Marcas e Modelos)
-- Arquivo: create_catalogo_equipamentos.sql (< 150 linhas)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS catalogo_equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL,
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_categoria_marca ON catalogo_equipamentos(categoria, marca);

ALTER TABLE catalogo_equipamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalogo_equipamentos_select_all" ON catalogo_equipamentos;
CREATE POLICY "catalogo_equipamentos_select_all" ON catalogo_equipamentos
    FOR SELECT TO authenticated USING (true);

-- Seed de marcas e modelos mais comuns na construção pesada e terraplenagem
INSERT INTO catalogo_equipamentos (categoria, marca, modelo) VALUES
-- Linha Amarela
('LINHA_AMARELA', 'Caterpillar', '320D'),
('LINHA_AMARELA', 'Caterpillar', '336D'),
('LINHA_AMARELA', 'Caterpillar', 'D6T'),
('LINHA_AMARELA', 'Caterpillar', 'D8T'),
('LINHA_AMARELA', 'Caterpillar', '924K'),
('LINHA_AMARELA', 'Caterpillar', '950L'),
('LINHA_AMARELA', 'Caterpillar', '140K'),
('LINHA_AMARELA', 'Komatsu', 'PC200-8'),
('LINHA_AMARELA', 'Komatsu', 'PC350LC'),
('LINHA_AMARELA', 'Komatsu', 'D61EX'),
('LINHA_AMARELA', 'Komatsu', 'WA320'),
('LINHA_AMARELA', 'Komatsu', 'GD655'),
('LINHA_AMARELA', 'Volvo', 'EC210D'),
('LINHA_AMARELA', 'Volvo', 'EC380DL'),
('LINHA_AMARELA', 'Volvo', 'L90H'),
('LINHA_AMARELA', 'Volvo', 'G930'),
('LINHA_AMARELA', 'Case', '580N'),
('LINHA_AMARELA', 'Case', 'CX220C'),
('LINHA_AMARELA', 'Case', '845B'),
('LINHA_AMARELA', 'JCB', '3CX'),
('LINHA_AMARELA', 'JCB', 'JS220LC'),
('LINHA_AMARELA', 'New Holland', 'B95B'),
('LINHA_AMARELA', 'New Holland', 'RG170.B'),
('LINHA_AMARELA', 'Hyundai', 'R220LC-9SB'),
('LINHA_AMARELA', 'Sany', 'SY215C'),
('LINHA_AMARELA', 'XCMG', 'XE215BR'),
('LINHA_AMARELA', 'Dynapac', 'CA250'),
('LINHA_AMARELA', 'Hamm', '3411'),

-- Caminhões & Transporte
('CAMINHAO_TRANSPORTE', 'Mercedes-Benz', 'Atego 2730 6x4'),
('CAMINHAO_TRANSPORTE', 'Mercedes-Benz', 'Axor 3344 6x4'),
('CAMINHAO_TRANSPORTE', 'Mercedes-Benz', 'Actros 2651'),
('CAMINHAO_TRANSPORTE', 'Volkswagen', 'Constellation 26.280 6x4'),
('CAMINHAO_TRANSPORTE', 'Volkswagen', 'Constellation 31.330 6x4'),
('CAMINHAO_TRANSPORTE', 'Volkswagen', 'Delivery 11.180'),
('CAMINHAO_TRANSPORTE', 'Volvo', 'FMX 460 6x4'),
('CAMINHAO_TRANSPORTE', 'Volvo', 'FMX 500 8x4'),
('CAMINHAO_TRANSPORTE', 'Volvo', 'VM 330 6x4'),
('CAMINHAO_TRANSPORTE', 'Scania', 'G440 XT 6x4'),
('CAMINHAO_TRANSPORTE', 'Scania', 'P360 XT 6x4'),
('CAMINHAO_TRANSPORTE', 'Iveco', 'Trakker 410T48 6x4'),

-- Equipamentos de Apoio
('EQUIPAMENTO_APOIO', 'Atlas Copco', 'QAS 70'),
('EQUIPAMENTO_APOIO', 'Atlas Copco', 'XAS 88'),
('EQUIPAMENTO_APOIO', 'Stemac', '150 kVA'),
('EQUIPAMENTO_APOIO', 'Stemac', '260 kVA'),
('EQUIPAMENTO_APOIO', 'Chicago Pneumatic', 'CP 1200'),
('EQUIPAMENTO_APOIO', 'MWM', 'Gerador 80 kVA'),

-- Veículos Leves
('VEICULO_LEVE', 'Toyota', 'Hilux 4x4 Cabine Dupla'),
('VEICULO_LEVE', 'Mitsubishi', 'L200 Triton 4x4'),
('VEICULO_LEVE', 'Ford', 'Ranger 4x4'),
('VEICULO_LEVE', 'Chevrolet', 'S10 4x4'),
('VEICULO_LEVE', 'Fiat', 'Strada Freedom');
