import { supabase } from '../lib/supabase';
import { filtroTenant } from './obraCustosExtrasService';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export interface ReceitasObraResultado {
  receitaTotal: number;
  receitaRecebida: number;
  receitaAReceber: number;
}

export async function buscarReceitasDaObra(
  obraId: string,
  tenantId?: string
): Promise<ReceitasObraResultado> {
  const ft = filtroTenant(tenantId);
  let qMed = supabase.from('medicoes').select('id, valor_total, status_pagamento, observacoes').eq('obra_id', obraId);
  if (ft) qMed = qMed.or(ft);

  const { data: medicoes, error } = await qMed;
  if (error) console.warn('[buscarReceitasDaObra] Erro em medicoes:', error.message);

  let receitaTotal = 0;
  let receitaRecebida = 0;
  let receitaAReceber = 0;
  const refsServicosContabilizados = new Set<string>();

  (medicoes || []).forEach((m) => {
    const v = Number(m.valor_total) || 0;
    receitaTotal += v;
    const status = m.status_pagamento || '';
    if (status === 'PAGO' || status === 'QUITADO') {
      receitaRecebida += v;
    } else {
      receitaAReceber += v;
    }

    const matchRef = (m.observacoes || '').match(/\[REF:([^\]]+)\]/);
    if (matchRef && matchRef[1]) {
      refsServicosContabilizados.add(matchRef[1]);
    }
  });

  // Complementa com serviços por horímetro que não geraram medição duplicada
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('terragest_servicos_horimetro') : null;
    const servicos: ServicoHorimetro[] = raw ? JSON.parse(raw) : [];
    servicos
      .filter((s) => s.obra_id === obraId && !refsServicosContabilizados.has(s.id))
      .forEach((s) => {
        const total = Number(s.faturamento_bruto || 0);
        const adiant = Number(s.valor_adiantamento || 0);
        receitaTotal += total;
        receitaRecebida += adiant;
        receitaAReceber += Math.max(0, total - adiant);
      });
  } catch {}

  return {
    receitaTotal,
    receitaRecebida,
    receitaAReceber
  };
}
