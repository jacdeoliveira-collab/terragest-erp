-- ==============================================================================
-- TerraGest SaaS - Campos eSocial (PIS/PASEP, Título de Eleitor, Reservista)
-- Arquivo: add_esocial_rh_funcionarios.sql (< 150 linhas)
-- ==============================================================================

ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS pis_pasep VARCHAR(30);
ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS titulo_eleitor VARCHAR(30);
ALTER TABLE rh_funcionarios ADD COLUMN IF NOT EXISTS reservista VARCHAR(50);
