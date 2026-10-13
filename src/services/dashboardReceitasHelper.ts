import type { MedicaoItem } from '../types/faturamento.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export interface TotaisReceitasDashboard {
  aReceberAberto: number;
  aReceberPago: number;
}

/**
 * Consolida valores a receber e recebidos no mês considerando tanto
 * medições de contratos quanto serviços comerciais por horímetro e seus adiantamentos.
 */
export function consolidarReceitasDashboard(
  servicos: ServicoHorimetro[],
  medicoes: MedicaoItem[],
  mesAtual: string
): TotaisReceitasDashboard {
  let aReceberAberto = 0;
  let aReceberPago = 0;
  const refsProcessadas = new Set<string>();

  // 1. Processar serviços por horímetro
  (servicos || []).forEach((s) => {
    if (!s?.id) return;
    refsProcessadas.add(s.id);

    // Se possui parcelas agendadas explicitamente
    if (Array.isArray(s.parcelas) && s.parcelas.length > 0) {
      s.parcelas.forEach((p) => {
        const val = Number(p.valor) || 0;
        const venc = p.data_vencimento || s.data_inicio;
        if (venc?.startsWith(mesAtual) || p.status !== 'PAGO') {
          if (p.status === 'PAGO') aReceberPago += val;
          else aReceberAberto += val;
        }
      });
      return;
    }

    // Sem parcelas detalhadas: consolida faturamento bruto e adiantamentos/havers
    const fat = Number(s.faturamento_bruto) || 0;
    const hist = Array.isArray(s.adiantamentos_historico) && s.adiantamentos_historico.length > 0
      ? s.adiantamentos_historico.reduce((sum, h) => sum + (Number(h.valor) || 0), 0)
      : 0;
    const rec = Math.max(Number(s.valor_adiantamento || 0), hist);
    const aberto = Math.max(0, Number((fat - rec).toFixed(2)));

    const mesRef = s.data_fim?.slice(0, 7) || s.data_inicio?.slice(0, 7) || s.created_at?.slice(0, 7);
    const pertenceAoMes = mesRef === mesAtual || aberto > 0;

    if (pertenceAoMes) {
      aReceberPago += rec;
      aReceberAberto += aberto;
    }
  });

  // 2. Processar medições tradicionais de obras (evitando duplicar serviços já processados)
  (medicoes || []).forEach((m) => {
    const matchRef = (m.observacoes || '').match(/\[REF:([^\]]+)\]/);
    if (matchRef && refsProcessadas.has(matchRef[1])) return;
    if (m.numero_medicao?.startsWith('HOR-')) {
      const prefix = m.numero_medicao.replace('HOR-', '').toLowerCase();
      if (servicos.some((s) => s.id?.toLowerCase().startsWith(prefix))) return;
    }

    const val = Number(m.valor_total) || 0;
    const comp = m.competencia || m.created_at?.slice(0, 7);
    const status = m.status_pagamento;
    const ehMes = comp === mesAtual || m.data_vencimento?.startsWith(mesAtual);

    if (ehMes || status === 'AGUARDANDO_PAGAMENTO' || status === 'PAGO_PARCIAL') {
      if (status === 'PAGO') {
        aReceberPago += val;
      } else if (status === 'PAGO_PARCIAL') {
        const adiantado = Number(m.valor_adiantamento || 0);
        aReceberPago += adiantado;
        aReceberAberto += Math.max(0, val - adiantado);
      } else {
        aReceberAberto += val;
      }
    }
  });

  return {
    aReceberAberto: Number(aReceberAberto.toFixed(2)),
    aReceberPago: Number(aReceberPago.toFixed(2))
  };
}
