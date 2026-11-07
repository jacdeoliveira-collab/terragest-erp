import type { DadosEmprestimoPagamento, ContaPagarItem } from '../types/contasPagar.types';

/**
 * Codifica os metadados de empréstimo dentro do campo observacoes (ou string auxiliar)
 * sem exigir alteração destrutiva de colunas no banco.
 */
export function formatarTagEmprestimo(dados: DadosEmprestimoPagamento): string {
  const credor = (dados.credorNome || 'Terceiro').replace(/[|\]]/g, ' ').trim();
  const dtPegou = (dados.dataEmprestimo || new Date().toISOString().slice(0, 10)).trim();
  const dtPagar = (dados.dataPagamentoPrevista || dtPegou).trim();
  return `[EMPRESTIMO|CREDOR:${credor}|DATA:${dtPegou}|PAGAR:${dtPagar}]`;
}

export function removerTagEmprestimo(texto?: string): string {
  if (!texto) return '';
  return texto.replace(/\[EMPRESTIMO\|[^\]]*\]\s*/g, '').trim();
}

export interface InfoEmprestimoExtraida {
  isEmprestimo: boolean;
  credorNome: string;
  dataEmprestimo: string;
  dataPagamentoPrevista: string;
  observacaoLimpa: string;
}

export function extrairInfoEmprestimo(item: Partial<ContaPagarItem>): InfoEmprestimoExtraida {
  const obs = item.observacoes || '';
  const match = obs.match(/\[EMPRESTIMO\|CREDOR:([^|]*)\|DATA:([^|]*)\|PAGAR:([^\]]*)\]/);

  const isPorCategoriaOuForma =
    item.categoria === 'EMPRESTIMOS' ||
    item.forma_pagamento === 'EMPRESTIMO' ||
    Boolean(match);

  if (match) {
    return {
      isEmprestimo: true,
      credorNome: match[1]?.trim() || item.fornecedor || 'Credor / Terceiro',
      dataEmprestimo: match[2]?.trim() || item.created_at?.slice(0, 10) || item.data_vencimento || '',
      dataPagamentoPrevista: match[3]?.trim() || item.data_vencimento || '',
      observacaoLimpa: removerTagEmprestimo(obs),
    };
  }

  return {
    isEmprestimo: isPorCategoriaOuForma,
    credorNome: item.fornecedor || 'Credor / Terceiro',
    dataEmprestimo: item.created_at?.slice(0, 10) || item.data_vencimento || '',
    dataPagamentoPrevista: item.data_vencimento || '',
    observacaoLimpa: obs,
  };
}

