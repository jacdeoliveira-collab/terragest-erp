import { supabase } from '../lib/supabase';
import { aplicarFiltroTenant, obterFiltroTenantString } from '../utils/tenantFilter';

export const filtroTenant = (tenantId?: string) => (tenantId ? obterFiltroTenantString(tenantId) : '');

export interface CustosExtrasObra {
  totalOutrasDespesas: number;
  totalFolha: number;
  totalMaoObraOperadores: number;
  custoEstimadoMaquinas: number;
  volumeProduzidoM3: number;
  qtdViagens: number;
}

/**
 * Custos da obra além de manutenção/combustível (que já vêm das tabelas de origem):
 * despesas em contas_pagar (exceto COMBUSTIVEL e MANUT_, para não duplicar),
 * mão de obra dos operadores (horas do BDE x custo/hora RH) e produção dos tickets.
 */
export async function buscarCustosExtrasObra(obraId: string, tenantId?: string): Promise<CustosExtrasObra> {
  let qCp = supabase.from('contas_pagar').select('valor, categoria, observacoes').eq('obra_id', obraId).neq('categoria', 'COMBUSTIVEL');
  let qBde = supabase.from('daily_bulletins').select('operador_id, equipment_id, total_hours').eq('obra_id', obraId);
  let qTk = supabase.from('apontamentos_viagens_producao').select('volume_m3').eq('obra_id', obraId);

  qCp = aplicarFiltroTenant(qCp, tenantId);
  qBde = aplicarFiltroTenant(qBde, tenantId);
  qTk = aplicarFiltroTenant(qTk, tenantId);

  const [cp, bde, tk] = await Promise.all([qCp, qBde, qTk]);
  if (cp.error) throw new Error(cp.error.message);

  let outras = 0;
  let folha = 0;
  (cp.data || []).forEach((c) => {
    if ((c.observacoes || '').includes('[REF:MANUT_')) return;
    const v = Number(c.valor) || 0;
    if (c.categoria === 'FOLHA_RH') folha += v; else outras += v;
  });

  const boletins = bde.data || [];
  const opIds = [...new Set(boletins.map((b) => b.operador_id).filter(Boolean))] as string[];
  const eqIds = [...new Set(boletins.map((b) => b.equipment_id).filter(Boolean))] as string[];
  const [rh, eq] = await Promise.all([
    opIds.length ? supabase.from('rh_funcionarios').select('id, custo_hora_normal').in('id', opIds) : Promise.resolve({ data: [] as { id: string; custo_hora_normal: number }[] }),
    eqIds.length ? supabase.from('equipment').select('id, custo_hora_estimado').in('id', eqIds) : Promise.resolve({ data: [] as { id: string; custo_hora_estimado: number }[] })
  ]);
  const custoOp = new Map((rh.data || []).map((r) => [r.id, Number(r.custo_hora_normal) || 0]));
  const custoEq = new Map((eq.data || []).map((e) => [e.id, Number(e.custo_hora_estimado) || 0]));

  let maoObra = 0;
  let estimado = 0;
  boletins.forEach((b) => {
    const h = Number(b.total_hours) || 0;
    maoObra += h * (custoOp.get(b.operador_id) || 0);
    estimado += h * (custoEq.get(b.equipment_id) || 0);
  });

  const tickets = tk.data || [];
  return {
    totalOutrasDespesas: outras,
    totalFolha: folha,
    totalMaoObraOperadores: maoObra,
    custoEstimadoMaquinas: estimado,
    volumeProduzidoM3: tickets.reduce((s, t) => s + (Number(t.volume_m3) || 0), 0),
    qtdViagens: tickets.length
  };
}
