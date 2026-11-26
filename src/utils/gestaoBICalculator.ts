import type {
  GestaoBIFiltros, GestaoBIResult, MaquinaDREItem,
  ClienteRankingItem, OperadorRankingItem, CentroCustoRankingItem
} from '../types/gestaoBI.types';
import {
  obterIntervaloDatas, dataNoIntervalo, calcularRadarEOpcoes, type GestaoBIRawData
} from './gestaoBIFiltrosHelper';

export type { GestaoBIRawData };

export function calcularGestaoBI(raw: GestaoBIRawData, filtros: GestaoBIFiltros): GestaoBIResult {
  const { ini, fim } = obterIntervaloDatas(filtros);
  const eqMap = new Map(raw.equipments.map((e) => [e.id, e]));
  const obraMap = new Map(raw.obras.map((o) => [o.id, o.nome || 'Centro de Custo']));

  const srvFiltrados = raw.servicos.filter((s) => {
    if (!dataNoIntervalo(s.data_inicio || s.created_at, ini, fim)) return false;
    if (filtros.maquinaId && s.maquina_id !== filtros.maquinaId) return false;
    if (filtros.clienteNome && (s.cliente_nome || '').trim().toLowerCase() !== filtros.clienteNome.toLowerCase()) return false;
    if (filtros.operadorNome && (s.operador_nome || '').trim().toLowerCase() !== filtros.operadorNome.toLowerCase()) return false;
    if (filtros.centroCustoId && s.obra_id !== filtros.centroCustoId) return false;
    return true;
  });

  const srvIds = new Set(srvFiltrados.map((s) => s.id));
  const temFiltroCliOuOp = Boolean(filtros.clienteNome || filtros.operadorNome);

  const abastFiltrados = raw.abastecimentos.filter((a) => {
    if (!dataNoIntervalo(a.data || a.created_at, ini, fim)) return false;
    if (filtros.maquinaId && a.maquina_id !== filtros.maquinaId) return false;
    if (filtros.centroCustoId && a.obra_id !== filtros.centroCustoId) return false;
    if (temFiltroCliOuOp && (!a.servico_id || !srvIds.has(a.servico_id))) return false;
    return true;
  });

  const manutFiltradas = raw.manutencoes.filter((m) => {
    if (!dataNoIntervalo(m.data_servico || m.data_ultima_execucao || m.created_at, ini, fim)) return false;
    if (filtros.maquinaId && (m.maquina_id || m.equipment_id) !== filtros.maquinaId) return false;
    if (filtros.centroCustoId && m.obra_id !== filtros.centroCustoId) return false;
    return !temFiltroCliOuOp;
  });

  const cpFiltradas = raw.contasPagar.filter((c) => {
    if (!dataNoIntervalo(c.data_vencimento || c.created_at, ini, fim)) return false;
    if (filtros.centroCustoId && c.obra_id !== filtros.centroCustoId) return false;
    if (filtros.operadorNome && !(c.fornecedor || '').toLowerCase().includes(filtros.operadorNome.toLowerCase())) return false;
    return true;
  });

  let horasTrabalhadas = 0, receitaTotal = 0, receitaRecebida = 0, saldoAReceber = 0, custoOperadores = 0;
  const maqAcc = new Map<string, MaquinaDREItem>();
  const cliAcc = new Map<string, ClienteRankingItem>();
  const opAcc = new Map<string, OperadorRankingItem>();
  const ccAcc = new Map<string, CentroCustoRankingItem>();

  const getMaq = (id: string, fallbackNome?: string) => {
    const key = id || 'SEM_MAQ';
    if (!maqAcc.has(key)) {
      const eq = eqMap.get(id);
      maqAcc.set(key, { id: key, nome: eq ? `${eq.code || ''} ${eq.name || ''}`.trim() : (fallbackNome || 'Sem Máquina'), horas: 0, receita: 0, dieselValor: 0, dieselLitros: 0, litrosHora: 0, manutencao: 0, operador: 0, lucro: 0, margemPercent: 0 });
    }
    return maqAcc.get(key)!;
  };

  for (const s of srvFiltrados) {
    const h = Number(s.horas_trabalhadas) || 0;
    const rec = Number(s.faturamento_bruto) || Number(s.valor_total_servico) || (h * (Number(s.valor_hora) || 0));
    const pago = s.status_pagamento_cliente === 'QUITADO'
      ? rec
      : (Number(s.valor_adiantamento) || Number(s.valor_recebido) || 0);
    const aberto = s.status_pagamento_cliente === 'QUITADO'
      ? 0
      : (s.saldo_restante !== undefined && s.saldo_restante !== null ? Math.max(0, Number(s.saldo_restante)) : Math.max(0, rec - pago));
    const vOp = Number(s.valor_hora_operador) > 0 ? h * Number(s.valor_hora_operador) : (Number(s.despesa_operador) || 0);

    horasTrabalhadas += h; receitaTotal += rec; receitaRecebida += pago; saldoAReceber += aberto; custoOperadores += vOp;
    const m = getMaq(s.maquina_id, s.maquina_nome); m.horas += h; m.receita += rec; m.operador += vOp;

    const cNome = (s.cliente_nome || 'Cliente Não Informado').trim();
    const cli = cliAcc.get(cNome) || { nome: cNome, horas: 0, faturado: 0, recebido: 0, emAberto: 0, qtdServicos: 0 };
    cli.horas += h; cli.faturado += rec; cli.recebido += pago; cli.emAberto += aberto; cli.qtdServicos += 1;
    cliAcc.set(cNome, cli);

    if (s.operador_nome) {
      const oNome = s.operador_nome.trim();
      const op = opAcc.get(oNome) || { nome: oNome, horas: 0, receitaGerada: 0, ganhos: 0, valesPagos: 0, saldoAPagar: 0 };
      op.horas += h; op.receitaGerada += rec; op.ganhos += vOp;
      opAcc.set(oNome, op);
    }

    if (s.obra_id) {
      const cc = ccAcc.get(s.obra_id) || { id: s.obra_id, nome: obraMap.get(s.obra_id) || 'Centro de Custo', receita: 0, custo: 0, lucro: 0, margemPercent: 0 };
      cc.receita += rec; cc.custo += vOp; ccAcc.set(s.obra_id, cc);
    }
  }

  let custoDiesel = 0, litrosDiesel = 0, custoManutencao = 0, outrosCustos = 0, custosPagos = 0;
  for (const a of abastFiltrados) {
    const val = Number(a.valor_total) || 0; const lit = Number(a.litros) || 0;
    custoDiesel += val; litrosDiesel += lit;
    if (a.maquina_id) { const m = getMaq(a.maquina_id); m.dieselValor += val; m.dieselLitros += lit; }
    if (a.obra_id && ccAcc.has(a.obra_id)) ccAcc.get(a.obra_id)!.custo += val;
  }
  for (const mn of manutFiltradas) {
    const val = (Number(mn.valor_pecas) || 0) + (Number(mn.valor_mao_obra) || 0);
    custoManutencao += val;
    const mId = mn.maquina_id || mn.equipment_id;
    if (mId && val > 0) getMaq(mId).manutencao += val;
    if (mn.obra_id && ccAcc.has(mn.obra_id)) ccAcc.get(mn.obra_id)!.custo += val;
  }
  for (const c of cpFiltradas) {
    const val = Number(c.valor) || 0;
    if (c.status === 'PAGO') custosPagos += val;
    const obs = String(c.observacoes || '');
    const desc = String(c.descricao || '').toLowerCase();
    if ((obs.includes('[VALE_RH]') || desc.includes('vale') || desc.includes('repasse')) && c.status === 'PAGO') {
      for (const op of opAcc.values()) {
        if ((c.fornecedor || '').toLowerCase().includes(op.nome.toLowerCase()) || desc.includes(op.nome.toLowerCase())) { op.valesPagos += val; break; }
      }
    }
    if (!['COMBUSTIVEL', 'FOLHA_RH', 'MANUTENCAO'].includes(String(c.categoria || '').toUpperCase())) outrosCustos += val;
  }

  const custoTotal = custoDiesel + custoOperadores + custoManutencao + outrosCustos;
  const lucroLiquido = receitaTotal - custoTotal;
  const porMaquina = Array.from(maqAcc.values()).map((m) => { const lucro = m.receita - m.dieselValor - m.manutencao - m.operador; return { ...m, litrosHora: m.horas > 0 ? m.dieselLitros / m.horas : 0, lucro, margemPercent: m.receita > 0 ? (lucro / m.receita) * 100 : 0 }; }).sort((a, b) => b.receita - a.receita);
  const porOperador = Array.from(opAcc.values()).map((o) => ({ ...o, saldoAPagar: Math.max(0, o.ganhos - o.valesPagos) })).sort((a, b) => b.horas - a.horas);
  const porCentroCusto = Array.from(ccAcc.values()).map((c) => ({ ...c, lucro: c.receita - c.custo, margemPercent: c.receita > 0 ? ((c.receita - c.custo) / c.receita) * 100 : 0 })).sort((a, b) => b.receita - a.receita);
  const { radar, opcoes } = calcularRadarEOpcoes(raw, eqMap);

  return {
    kpis: {
      horasTrabalhadas, receitaTotal, receitaRecebida, saldoAReceber, custoDiesel, litrosDiesel, custoOperadores, custoManutencao, outrosCustos, custoTotal, custosPagos, lucroLiquido,
      margemPercent: receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0, receitaPorHora: horasTrabalhadas > 0 ? receitaTotal / horasTrabalhadas : 0,
      custoPorHora: horasTrabalhadas > 0 ? custoTotal / horasTrabalhadas : 0, litrosPorHora: horasTrabalhadas > 0 ? litrosDiesel / horasTrabalhadas : 0, qtdServicos: srvFiltrados.length
    },
    porMaquina, porCliente: Array.from(cliAcc.values()).sort((a, b) => b.faturado - a.faturado), porOperador, porCentroCusto, radar, opcoes
  };
}
