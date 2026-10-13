import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { filtroTenant } from '../services/obraCustosExtrasService';
import { useTenantContext } from '../contexts/TenantContext';

export interface ProducaoMedicao {
  viagens: number;
  volumeM3: number;
}

/** Produção (tickets do Sinaleiro) da obra no mês de competência da medição. */
export function useProducaoMedicao() {
  const { tenantAtivoId } = useTenantContext();
  const [producao, setProducao] = useState<ProducaoMedicao | null>(null);

  const buscarProducao = useCallback(async (obraId: string, competencia: string) => {
    const [ano, mes] = competencia.split('-').map(Number);
    const ini = new Date(ano, mes - 1, 1).toISOString();
    const fim = new Date(ano, mes, 1).toISOString();
    let q = supabase.from('apontamentos_viagens_producao').select('volume_m3')
      .eq('obra_id', obraId).gte('data_hora', ini).lt('data_hora', fim);
    const ft = filtroTenant(tenantAtivoId || undefined);
    if (ft) q = q.or(ft);
    const { data, error } = await q;
    if (error) { setProducao(null); return null; }
    const res = { viagens: data?.length || 0, volumeM3: (data || []).reduce((s, t) => s + (Number(t.volume_m3) || 0), 0) };
    setProducao(res);
    return res;
  }, [tenantAtivoId]);

  return { producao, buscarProducao };
}

export const textoProducao = (p: ProducaoMedicao | null) =>
  p && p.viagens > 0 ? `Produção no período (Sinaleiro): ${p.volumeM3.toLocaleString('pt-BR')} m³ em ${p.viagens} viagens.` : '';
