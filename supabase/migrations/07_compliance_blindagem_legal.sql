-- ==============================================================================
-- TerraGest SaaS - Migração: Compliance Jurídico & Blindagem Legal (RH e Equipamentos)
-- Arquivo: 07_compliance_blindagem_legal.sql (< 150 linhas)
-- ==============================================================================

-- 1. Expansão da Tabela rh_funcionarios (Compliance Trabalhista e Ocupacional)
ALTER TABLE rh_funcionarios 
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
    ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
    ADD COLUMN IF NOT EXISTS cnh VARCHAR(20),
    ADD COLUMN IF NOT EXISTS validade_cnh DATE,
    ADD COLUMN IF NOT EXISTS endereco_completo TEXT,
    ADD COLUMN IF NOT EXISTS ctps VARCHAR(30),
    ADD COLUMN IF NOT EXISTS aso_validade DATE,
    ADD COLUMN IF NOT EXISTS drive_url_documentos TEXT;

-- Compatibilidade se por acaso documento_url foi criado antes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rh_funcionarios' AND column_name='documento_url') THEN
    ALTER TABLE rh_funcionarios RENAME COLUMN documento_url TO drive_url_documentos;
  END IF;
END $$;

-- Criação de índices para consultas ágeis de compliance
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_cpf ON rh_funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_validade_cnh ON rh_funcionarios(validade_cnh);
CREATE INDEX IF NOT EXISTS idx_rh_funcionarios_aso_validade ON rh_funcionarios(aso_validade);

-- Comentários de governança e auditoria
COMMENT ON COLUMN rh_funcionarios.cpf IS 'Cadastro de Pessoa Física do colaborador';
COMMENT ON COLUMN rh_funcionarios.rg IS 'Registro Geral (Identidade)';
COMMENT ON COLUMN rh_funcionarios.cnh IS 'Número de Registro da Carteira Nacional de Habilitação';
COMMENT ON COLUMN rh_funcionarios.validade_cnh IS 'Data de expiração da CNH';
COMMENT ON COLUMN rh_funcionarios.endereco_completo IS 'Endereço residencial completo do colaborador';
COMMENT ON COLUMN rh_funcionarios.ctps IS 'Número e série da Carteira de Trabalho e Previdência Social';
COMMENT ON COLUMN rh_funcionarios.aso_validade IS 'Data de validade do Atestado de Saúde Ocupacional (NR-7)';
COMMENT ON COLUMN rh_funcionarios.drive_url_documentos IS 'Link dos documentos digitalizados no Google Drive';

-- 2. Expansão da Tabela equipment (Patrimônio, Trânsito e Inspeção Veicular)
ALTER TABLE equipment 
    ADD COLUMN IF NOT EXISTS chassi VARCHAR(30),
    ADD COLUMN IF NOT EXISTS renavam VARCHAR(20),
    ADD COLUMN IF NOT EXISTS ano_fabricacao INT,
    ADD COLUMN IF NOT EXISTS drive_url_foto TEXT;

-- Compatibilidade se por acaso foto_url foi criado antes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='equipment' AND column_name='foto_url') THEN
    ALTER TABLE equipment RENAME COLUMN foto_url TO drive_url_foto;
  END IF;
END $$;

-- Criação de índices para identificação veicular
CREATE INDEX IF NOT EXISTS idx_equipment_chassi ON equipment(chassi);
CREATE INDEX IF NOT EXISTS idx_equipment_renavam ON equipment(renavam);

-- Comentários de patrimônio e frota
COMMENT ON COLUMN equipment.chassi IS 'Número identificador do chassi (VIN)';
COMMENT ON COLUMN equipment.renavam IS 'Registro Nacional de Veículos Automotores';
COMMENT ON COLUMN equipment.ano_fabricacao IS 'Ano de fabricação do equipamento/veículo';
COMMENT ON COLUMN equipment.drive_url_foto IS 'Link da foto do equipamento no Google Drive';
