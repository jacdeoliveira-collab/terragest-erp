export function calcularVencimentoSalarioOperador(
  dataReferencia: string,
  diaPagamento: number = 5
): string {
  try {
    const partes = dataReferencia.split('-');
    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    if (!ano || !mes) return dataReferencia;

    // Se o serviço ocorreu no mês M (fechamento dias 30/31),
    // o pagamento é creditado no mês seguinte (M+1) até o dia configurado (ex: dia 5)
    let proxMes = mes + 1;
    let proxAno = ano;
    if (proxMes > 12) {
      proxMes = 1;
      proxAno = ano + 1;
    }

    const diaFinal = Math.min(Math.max(1, diaPagamento || 5), 28);
    const mm = String(proxMes).padStart(2, '0');
    const dd = String(diaFinal).padStart(2, '0');
    return `${proxAno}-${mm}-${dd}`;
  } catch {
    return dataReferencia;
  }
}
