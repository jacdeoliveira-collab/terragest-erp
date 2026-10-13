export interface CondicaoPagamentoResult {
  prazoDescricao: string;
  dataVencimento: string;
}

export function calcularCondicaoPagamento(val: string): CondicaoPagamentoResult {
  const hoje = new Date();
  const formatarData = (d: Date) => d.toISOString().slice(0, 10);

  if (val === 'A_VISTA') {
    return {
      prazoDescricao: 'À vista na aprovação / liberação da máquina',
      dataVencimento: formatarData(hoje)
    };
  }
  if (val === '15_DIAS') {
    const d = new Date(hoje);
    d.setDate(d.getDate() + 15);
    return {
      prazoDescricao: 'Pagamento faturado em 15 dias após medição',
      dataVencimento: formatarData(d)
    };
  }
  if (val === '30_DIAS') {
    const d = new Date(hoje);
    d.setDate(d.getDate() + 30);
    return {
      prazoDescricao: 'Pagamento faturado em 30 dias após medição',
      dataVencimento: formatarData(d)
    };
  }
  if (val === 'SINAL_50_50') {
    const d = new Date(hoje);
    d.setDate(d.getDate() + 15);
    return {
      prazoDescricao: '50% de entrada no aceite e 50% na conclusão da obra',
      dataVencimento: formatarData(d)
    };
  }
  if (val === 'PARCELADO_2X') {
    const d = new Date(hoje);
    d.setDate(d.getDate() + 30);
    return {
      prazoDescricao: 'Parcelado em 2x (30 e 60 dias)',
      dataVencimento: formatarData(d)
    };
  }
  return {
    prazoDescricao: 'Personalizado',
    dataVencimento: formatarData(hoje)
  };
}
