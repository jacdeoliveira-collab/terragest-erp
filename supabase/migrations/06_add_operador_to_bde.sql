-- ==============================================================================
-- TerraGest SaaS - Vínculo Relacional: RH com Boletins Diários (BDE)
-- Arquivo: 06_add_operador_to_bde.sql
-- ==============================================================================

ALTER TABLE daily_bulletins 
ADD COLUMN IF NOT EXISTS operador_id UUID REFERENCES rh_funcionarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_daily_bulletins_operador_id ON daily_bulletins(operador_id);

COMMENT ON COLUMN daily_bulletins.operador_id IS 'Chave estrangeira relacionando o apontamento do BDE ao colaborador cadastrado no RH.';
