export type StatusRevisao = 'EM_DIA' | 'PROXIMO_VENCIMENTO' | 'ATRASADO';

/** Antecedência do alerta: 500 km para veículos, 30 horas para máquinas. */
export function margemAlertaRevisao(isKm: boolean): number {
  return isKm ? 500 : 30;
}

export function calcularStatusRevisao(leituraAtual: number, leituraAlvo: number, isKm: boolean): StatusRevisao {
  if (leituraAtual >= leituraAlvo) return 'ATRASADO';
  if (leituraAlvo - leituraAtual <= margemAlertaRevisao(isKm)) return 'PROXIMO_VENCIMENTO';
  return 'EM_DIA';
}

export function intervalosSugeridos(isKm: boolean): number[] {
  return isKm ? [5000, 10000, 20000, 40000] : [250, 500, 1000, 2000];
}
