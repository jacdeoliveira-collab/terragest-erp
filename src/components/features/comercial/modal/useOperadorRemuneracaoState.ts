import { useState, useEffect } from 'react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

export function useOperadorRemuneracaoState(servicoParaEditar?: ServicoHorimetro | null) {
  const [valorHoraOperador, setValorHoraOperador] = useState<number>(servicoParaEditar?.valor_hora_operador || 0);
  const [adiantamentoOperadorValor, setAdiantamentoOperadorValor] = useState<number>(servicoParaEditar?.adiantamento_operador_valor || 0);
  const [adiantamentoOperadorData, setAdiantamentoOperadorData] = useState<string>(servicoParaEditar?.adiantamento_operador_data || '');
  const [dataPagamentoOperador, setDataPagamentoOperador] = useState<string>(servicoParaEditar?.data_pagamento_operador || '');

  useEffect(() => {
    setValorHoraOperador(servicoParaEditar?.valor_hora_operador || 0);
    setAdiantamentoOperadorValor(servicoParaEditar?.adiantamento_operador_valor || 0);
    setAdiantamentoOperadorData(servicoParaEditar?.adiantamento_operador_data || '');
    setDataPagamentoOperador(servicoParaEditar?.data_pagamento_operador || '');
  }, [servicoParaEditar]);

  return {
    valorHoraOperador, setValorHoraOperador,
    adiantamentoOperadorValor, setAdiantamentoOperadorValor,
    adiantamentoOperadorData, setAdiantamentoOperadorData,
    dataPagamentoOperador, setDataPagamentoOperador
  };
}
