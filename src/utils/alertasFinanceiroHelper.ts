import type { ContaPagarItem } from '../types/contasPagar.types';
import type { MedicaoItem } from '../types/faturamento.types';
import type { AlertaItem } from '../types/alertaCentral.types';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function extrairAlertasFinanceiro(
  pagar: ContaPagarItem[],
  receber: MedicaoItem[]
): AlertaItem[] {
  const alertas: AlertaItem[] = [];
  const hoje = new Date().toISOString().slice(0, 10);
  const limite5Dias = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  // Contas a Pagar
  pagar.forEach((p) => {
    if (p.status !== 'PENDENTE' || !p.data_vencimento) return;
    const valor = Number(p.valor || 0);
    const valFmt = fmtBRL(valor);
    const forn = p.fornecedor || 'Fornecedor';

    if (p.data_vencimento < hoje) {
      alertas.push({
        id: `pagar-vencida-${p.id}`,
        modulo: 'FINANCEIRO_PAGAR',
        titulo: `Conta Vencida: ${p.descricao || 'Despesa'}`,
        descricao: `Venceu em ${p.data_vencimento.split('-').reverse().join('/')} - ${forn}`,
        nivel: 'CRITICO',
        dataReferencia: p.data_vencimento,
        rota: '/financeiro?aba=pagar',
        valorFormatado: valFmt,
        tagModulo: 'Contas a Pagar'
      });
    } else if (p.data_vencimento <= limite5Dias) {
      alertas.push({
        id: `pagar-prox-${p.id}`,
        modulo: 'FINANCEIRO_PAGAR',
        titulo: `Conta a Vencer: ${p.descricao || 'Despesa'}`,
        descricao: `Vence em ${p.data_vencimento.split('-').reverse().join('/')} - ${forn}`,
        nivel: 'ALERTA',
        dataReferencia: p.data_vencimento,
        rota: '/financeiro?aba=pagar',
        valorFormatado: valFmt,
        tagModulo: 'Contas a Pagar'
      });
    }
  });

  // Contas a Receber
  receber.forEach((r) => {
    if (r.status_pagamento === 'PAGO' || !r.data_vencimento) return;
    const valor = Number(r.saldo_restante || r.valor_total || 0);
    const valFmt = fmtBRL(valor);
    const identificador = r.cliente_nome || r.obra_nome || r.numero_medicao || 'Medição';

    if (r.data_vencimento < hoje) {
      alertas.push({
        id: `receber-atrasado-${r.id}`,
        modulo: 'FINANCEIRO_RECEBER',
        titulo: `Faturamento Atrasado: ${identificador}`,
        descricao: `Venceu em ${r.data_vencimento.split('-').reverse().join('/')} (${r.numero_medicao || 'Medição'})`,
        nivel: 'CRITICO',
        dataReferencia: r.data_vencimento,
        rota: '/financeiro?aba=receber',
        valorFormatado: valFmt,
        tagModulo: 'Contas a Receber'
      });
    } else if (r.data_vencimento <= limite5Dias) {
      alertas.push({
        id: `receber-prox-${r.id}`,
        modulo: 'FINANCEIRO_RECEBER',
        titulo: `Faturamento a Vencer: ${identificador}`,
        descricao: `Vence em ${r.data_vencimento.split('-').reverse().join('/')} (${r.numero_medicao || 'Medição'})`,
        nivel: 'ALERTA',
        dataReferencia: r.data_vencimento,
        rota: '/financeiro?aba=receber',
        valorFormatado: valFmt,
        tagModulo: 'Contas a Receber'
      });
    }
  });

  return alertas;
}
