import type { ContaPagarItem } from '../types/contasPagar.types';

export interface AmortizacaoEmprestimoItem {
  id: string;
  data: string;
  valor: number;
  forma: string;
  descricao: string;
  contaBancariaId?: string | null;
  contaPagarGeradaId?: string | null;
}

export interface ResumoAmortizacaoEmprestimo {
  valorOriginal: number;
  totalAmortizado: number;
  saldoRestante: number;
  percentualPago: number;
  historico: AmortizacaoEmprestimoItem[];
}

export function isRegistroAbatimentoEmprestimo(obs?: string | null): boolean {
  return Boolean(obs && obs.includes('[ABAT_EMP:'));
}

export function extrairAmortizacoesEmprestimo(item: Partial<ContaPagarItem>): ResumoAmortizacaoEmprestimo {
  const obs = item.observacoes || '';
  const matchOrig = obs.match(/\[VALOR_ORIG:([0-9.]+)\]/);
  const matchHist = obs.match(/\[ABATIMENTOS_JSON:(\[[\s\S]*?\])\]/);

  let historico: AmortizacaoEmprestimoItem[] = [];
  if (matchHist?.[1]) {
    try {
      const parsed = JSON.parse(matchHist[1]);
      if (Array.isArray(parsed)) historico = parsed;
    } catch {}
  }

  const totalAmortizadoHist = Number(
    historico.reduce((acc, a) => acc + (Number(a.valor) || 0), 0).toFixed(2)
  );
  const valorAtualDb = Number(item.valor) || 0;
  const isPago = item.status === 'PAGO';

  if (isPago && historico.length === 0) {
    return { valorOriginal: valorAtualDb, totalAmortizado: valorAtualDb, saldoRestante: 0, percentualPago: 100, historico: [] };
  }

  const valorOriginal = matchOrig?.[1]
    ? Number(matchOrig[1])
    : Number((isPago ? totalAmortizadoHist : valorAtualDb + totalAmortizadoHist).toFixed(2));
  const totalAmortizado = isPago ? valorOriginal : totalAmortizadoHist;
  const saldoRestante = isPago ? 0 : Number(Math.max(0, valorOriginal - totalAmortizado).toFixed(2));
  const percentualPago = valorOriginal > 0 ? Math.min(100, (totalAmortizado / valorOriginal) * 100) : 0;

  return { valorOriginal, totalAmortizado, saldoRestante, percentualPago, historico };
}

export function montarObservacoesComAmortizacoes(
  observacoesAtuais: string | undefined | null,
  valorOriginal: number,
  historico: AmortizacaoEmprestimoItem[]
): string {
  const limpa = (observacoesAtuais || '')
    .replace(/\[VALOR_ORIG:[0-9.]+\]\s*/g, '')
    .replace(/\[ABATIMENTOS_JSON:\[[\s\S]*?\]\]\s*/g, '')
    .trim();

  if (historico.length === 0) return limpa;

  const tagOrig = `[VALOR_ORIG:${valorOriginal.toFixed(2)}]`;
  const tagHist = `[ABATIMENTOS_JSON:${JSON.stringify(historico)}]`;
  return [limpa, tagOrig, tagHist].filter(Boolean).join(' ').trim();
}
