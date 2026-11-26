import type { GestaoBIFiltros, GestaoBIRadar, GestaoBIOpcoesFiltro } from '../types/gestaoBI.types';

export interface GestaoBIRawData {
  servicos: any[];
  abastecimentos: any[];
  contasPagar: any[];
  equipments: any[];
  manutencoes: any[];
  agenda: any[];
  obras: any[];
}

export function obterIntervaloDatas(f: GestaoBIFiltros): { ini: string; fim: string } {
  const hoje = new Date();
  const fimHoje = hoje.toISOString().slice(0, 10);
  if (f.periodo === 'PERSONALIZADO') return { ini: f.dataInicio || '2000-01-01', fim: f.dataFim || '2099-12-31' };
  if (f.periodo === 'TUDO') return { ini: '2000-01-01', fim: '2099-12-31' };
  if (f.periodo === 'MES_ATUAL') return { ini: `${fimHoje.slice(0, 7)}-01`, fim: '2099-12-31' };
  if (f.periodo === 'ANO') return { ini: `${fimHoje.slice(0, 4)}-01-01`, fim: '2099-12-31' };
  const d = new Date(hoje);
  d.setDate(d.getDate() - (f.periodo === '90D' ? 90 : 30));
  return { ini: d.toISOString().slice(0, 10), fim: '2099-12-31' };
}

export function dataNoIntervalo(dt: string | null | undefined, ini: string, fim: string): boolean {
  if (!dt) return true;
  const s = String(dt).slice(0, 10);
  return s >= ini && s <= fim;
}

export function calcularRadarEOpcoes(raw: GestaoBIRawData, eqMap: Map<string, any>): { radar: GestaoBIRadar; opcoes: GestaoBIOpcoesFiltro } {
  const filaAgenda = raw.agenda.filter((ag) => !['CONCLUIDO', 'CANCELADO', 'ENCERRADO'].includes(String(ag.status || '').toUpperCase()));
  const manutVencidas = raw.manutencoes.filter((m) => {
    const eq = eqMap.get(m.maquina_id || m.equipment_id);
    const alvo = Number(m.horimetro_proxima_troca) || 0;
    return m.status !== 'REALIZADO' && alvo > 0 && Number(eq?.current_hourmeter || 0) >= alvo;
  }).length;
  const manutProx = raw.manutencoes.filter((m) => {
    const eq = eqMap.get(m.maquina_id || m.equipment_id);
    const alvo = Number(m.horimetro_proxima_troca) || 0;
    const cur = Number(eq?.current_hourmeter || 0);
    return m.status !== 'REALIZADO' && alvo > 0 && cur < alvo && alvo - cur <= 50;
  }).length;

  return {
    radar: {
      agendaNaFila: filaAgenda.length,
      agendaHorasPrevistas: filaAgenda.reduce((a, b) => a + (Number(b.horas_estimadas ?? b.horas_previstas) || 0), 0),
      manutencoesVencidas: manutVencidas,
      manutencoesProximas: manutProx,
      frotasAtivas: raw.equipments.filter((e) => e.status !== 'INACTIVE').length,
      totalFrota: raw.equipments.length,
      centrosAtivos: raw.obras.filter((o) => o.status === 'EM_ANDAMENTO' || o.status === 'ATIVA').length
    },
    opcoes: {
      maquinas: raw.equipments.map((e) => ({ id: e.id, label: `${e.code || ''} - ${e.name || ''}`.replace(/^\s*-\s*/, '') })),
      clientes: Array.from(new Set(raw.servicos.map((s) => (s.cliente_nome || '').trim()).filter(Boolean))).sort(),
      operadores: Array.from(new Set(raw.servicos.map((s) => (s.operador_nome || '').trim()).filter(Boolean))).sort(),
      centrosCusto: raw.obras.map((o) => ({ id: o.id, nome: o.nome || 'Centro de Custo' }))
    }
  };
}
