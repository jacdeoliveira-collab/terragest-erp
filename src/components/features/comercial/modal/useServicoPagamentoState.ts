import { useState, useEffect } from 'react';
import type { ServicoHorimetro, ParcelaItem } from '../../../../types/servicoHorimetro.types';

const PRAZO_PADRAO = 'À vista na conclusão do serviço';

export function useServicoPagamentoState(servico: ServicoHorimetro | null | undefined) {
  const [formaPagamento, setFormaPagamento] = useState(servico?.forma_pagamento || 'PIX');
  const [condicaoPagamento, setCondicaoPagamento] = useState(servico?.condicao_pagamento || 'A_VISTA');
  const [contaBancariaId, setContaBancariaId] = useState(servico?.conta_bancaria_id || '');
  const [prazoDescricao, setPrazoDescricao] = useState(servico?.prazo_descricao || PRAZO_PADRAO);
  const [dataVencimento, setDataVencimento] = useState(servico?.data_vencimento || new Date().toISOString().slice(0, 10));
  const [parcelas, setParcelas] = useState<ParcelaItem[]>(servico?.parcelas || []);

  useEffect(() => {
    setFormaPagamento(servico?.forma_pagamento || 'PIX');
    setCondicaoPagamento(servico?.condicao_pagamento || 'A_VISTA');
    setContaBancariaId(servico?.conta_bancaria_id || '');
    setPrazoDescricao(servico?.prazo_descricao || PRAZO_PADRAO);
    setDataVencimento(servico?.data_vencimento || new Date().toISOString().slice(0, 10));
    setParcelas(Array.isArray(servico?.parcelas) ? servico!.parcelas : []);
  }, [servico]);

  const gerarParcelas = (qtd: number, saldoRestante: number, dataBase?: string) => {
    if (qtd <= 0) { setParcelas([]); return; }
    const base = dataBase ? new Date(dataBase + 'T12:00:00') : new Date();
    const valBase = Number((saldoRestante / qtd).toFixed(2));
    const novas: ParcelaItem[] = [];
    let acumulado = 0;

    for (let i = 1; i <= qtd; i++) {
      const v = i === qtd ? Number((saldoRestante - acumulado).toFixed(2)) : valBase;
      acumulado += v;
      const dtVenc = new Date(base);
      dtVenc.setDate(dtVenc.getDate() + (i * 30));
      novas.push({
        id: `PARC_${Date.now()}_${i}`,
        numero: i,
        valor: v > 0 ? v : 0,
        data_vencimento: dtVenc.toISOString().slice(0, 10),
        forma_pagamento: formaPagamento || 'PIX',
        status: 'PENDENTE',
        observacao: `Parcela ${i}/${qtd}`
      });
    }
    setParcelas(novas);
  };

  const atualizarParcela = (id: string, updates: Partial<ParcelaItem>) => {
    setParcelas((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const adicionarParcela = (saldoSugerido?: number) => {
    const num = parcelas.length + 1;
    const dt = new Date();
    dt.setDate(dt.getDate() + (num * 30));
    setParcelas((prev) => [
      ...prev,
      {
        id: `PARC_${Date.now()}_${num}`,
        numero: num,
        valor: saldoSugerido && saldoSugerido > 0 ? Number(saldoSugerido.toFixed(2)) : 0,
        data_vencimento: dt.toISOString().slice(0, 10),
        forma_pagamento: formaPagamento || 'PIX',
        status: 'PENDENTE',
        observacao: `Parcela ${num}`
      }
    ]);
  };

  const removerParcela = (id: string) => {
    setParcelas((prev) => prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, numero: idx + 1 })));
  };

  return {
    formaPagamento, setFormaPagamento,
    condicaoPagamento, setCondicaoPagamento,
    contaBancariaId, setContaBancariaId,
    prazoDescricao, setPrazoDescricao,
    dataVencimento, setDataVencimento,
    parcelas, setParcelas,
    gerarParcelas, atualizarParcela, adicionarParcela, removerParcela
  };
}
