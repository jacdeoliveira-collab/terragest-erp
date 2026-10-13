-- ==============================================================================
-- TerraGest SaaS - Migração 21: Upgrade Enterprise do BDE (Infraestrutura)
-- ==============================================================================

ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS estaca_inicial VARCHAR(50);
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS estaca_final VARCHAR(50);
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS horas_produtivas NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS horas_ociosas NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(30) DEFAULT 'PENDENTE';
ALTER TABLE daily_bulletins ADD COLUMN IF NOT EXISTS motivo_parada VARCHAR(200);

-- Índice para acelerar consultas por obra, status de aprovação e estacas
CREATE INDEX IF NOT EXISTS idx_daily_bulletins_aprovacao ON daily_bulletins(tenant_id, obra_id, status_aprovacao);
