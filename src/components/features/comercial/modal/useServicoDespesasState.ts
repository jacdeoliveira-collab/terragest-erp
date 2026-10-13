import { useState, useEffect } from 'react';
import type { ServicoHorimetro, FotoTrabalhoItem, AdiantamentoItem, DespesaItemServico } from '../../../../types/servicoHorimetro.types';

function parseInitialAdiantamentos(servico?: ServicoHorimetro | null): AdiantamentoItem[] {
  if (servico?.adiantamentos_historico && Array.isArray(servico.adiantamentos_historico) && servico.adiantamentos_historico.length > 0) {
    return servico.adiantamentos_historico;
  }
  if (servico?.valor_adiantamento && Number(servico.valor_adiantamento) > 0) {
    return [{
      id: 'ad_init_1',
      valor: Number(servico.valor_adiantamento),
      data: servico.data_adiantamento || new Date().toISOString().slice(0, 10),
      forma_pagamento: servico.forma_pagamento_adiantamento || 'PIX',
      observacao: 'Sinal / Entrada'
    }];
  }
  return [];
}

export function useServicoDespesasState(servicoParaEditar?: ServicoHorimetro | null) {
  const [combustivelMaquinaLitros, setCombustivelMaquinaLitros] = useState<number>(servicoParaEditar?.combustivel_maquina_litros || 0);
  const [combustivelMaquinaValor, setCombustivelMaquinaValor] = useState<number>(servicoParaEditar?.combustivel_maquina_valor || 0);
  const [combustivelApoioLitros, setCombustivelApoioLitros] = useState<number>(servicoParaEditar?.combustivel_apoio_litros || 0);
  const [combustivelApoioValor, setCombustivelApoioValor] = useState<number>(servicoParaEditar?.combustivel_apoio_valor || 0);
  const [fotoCupom, setFotoCupom] = useState<string | undefined>(servicoParaEditar?.foto_cupom_combustivel);
  const [despesaOperador, setDespesaOperador] = useState<number>(servicoParaEditar?.despesa_operador || 0);

  // Peças, Lubrificantes & Manutenção
  const itemM = servicoParaEditar?.despesas_itens?.find((d) => d.categoria === 'PECAS_LUBRIFICANTES');
  const [despesaManutencao, setDespesaManutencao] = useState<number>(servicoParaEditar?.despesa_manutencao || itemM?.valor || 0);
  const [descricaoManutencao, setDescricaoManutencao] = useState<string>(itemM?.descricao || '');
  const [fornecedorManutencao, setFornecedorManutencao] = useState<string>(itemM?.fornecedor || '');
  const [formaPagamentoManutencao, setFormaPagamentoManutencao] = useState<string>(itemM?.forma_pagamento || 'PIX');
  const [statusPagamentoManutencao, setStatusPagamentoManutencao] = useState<'PAGO' | 'PENDENTE'>(itemM?.status_pagamento || 'PAGO');
  const [fotoCupomManutencao, setFotoCupomManutencao] = useState<string | undefined>(itemM?.comprovante_url);

  // Logística, Frete Prancha & Apoio
  const itemA = servicoParaEditar?.despesas_itens?.find((d) => d.categoria === 'LOGISTICA_APOIO');
  const [despesaApoio, setDespesaApoio] = useState<number>(servicoParaEditar?.despesa_apoio || itemA?.valor || 0);
  const [descricaoApoio, setDescricaoApoio] = useState<string>(itemA?.descricao || '');
  const [fornecedorApoio, setFornecedorApoio] = useState<string>(itemA?.fornecedor || '');
  const [formaPagamentoApoio, setFormaPagamentoApoio] = useState<string>(itemA?.forma_pagamento || 'PIX');
  const [statusPagamentoApoio, setStatusPagamentoApoio] = useState<'PAGO' | 'PENDENTE'>(itemA?.status_pagamento || 'PAGO');
  const [fotoCupomApoio, setFotoCupomApoio] = useState<string | undefined>(itemA?.comprovante_url);

  const [abastecimentosIds, setAbastecimentosIds] = useState<string[]>(servicoParaEditar?.abastecimentos_ids || []);
  const [adiantamentosHistorico, setAdiantamentosHistorico] = useState<AdiantamentoItem[]>(() => parseInitialAdiantamentos(servicoParaEditar));
  const [fotosTrabalho, setFotosTrabalho] = useState<FotoTrabalhoItem[]>(servicoParaEditar?.fotos_trabalho || []);
  const [observacoes, setObservacoes] = useState<string>(servicoParaEditar?.observacoes || '');

  useEffect(() => {
    setCombustivelMaquinaLitros(servicoParaEditar?.combustivel_maquina_litros || 0);
    setCombustivelMaquinaValor(servicoParaEditar?.combustivel_maquina_valor || 0);
    setCombustivelApoioLitros(servicoParaEditar?.combustivel_apoio_litros || 0);
    setCombustivelApoioValor(servicoParaEditar?.combustivel_apoio_valor || 0);
    setFotoCupom(servicoParaEditar?.foto_cupom_combustivel);
    setDespesaOperador(servicoParaEditar?.despesa_operador || 0);

    const m = servicoParaEditar?.despesas_itens?.find((d) => d.categoria === 'PECAS_LUBRIFICANTES');
    setDespesaManutencao(servicoParaEditar?.despesa_manutencao || m?.valor || 0);
    setDescricaoManutencao(m?.descricao || '');
    setFornecedorManutencao(m?.fornecedor || '');
    setFormaPagamentoManutencao(m?.forma_pagamento || 'PIX');
    setStatusPagamentoManutencao(m?.status_pagamento || 'PAGO');
    setFotoCupomManutencao(m?.comprovante_url);

    const a = servicoParaEditar?.despesas_itens?.find((d) => d.categoria === 'LOGISTICA_APOIO');
    setDespesaApoio(servicoParaEditar?.despesa_apoio || a?.valor || 0);
    setDescricaoApoio(a?.descricao || '');
    setFornecedorApoio(a?.fornecedor || '');
    setFormaPagamentoApoio(a?.forma_pagamento || 'PIX');
    setStatusPagamentoApoio(a?.status_pagamento || 'PAGO');
    setFotoCupomApoio(a?.comprovante_url);

    setAbastecimentosIds(servicoParaEditar?.abastecimentos_ids || []);
    setAdiantamentosHistorico(parseInitialAdiantamentos(servicoParaEditar));
    setFotosTrabalho(servicoParaEditar?.fotos_trabalho || []);
    setObservacoes(servicoParaEditar?.observacoes || '');
  }, [servicoParaEditar]);

  const valorAdiantamento = Number(adiantamentosHistorico.reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2));
  const ultimo = adiantamentosHistorico[adiantamentosHistorico.length - 1];
  const dataAdiantamento = ultimo?.data || servicoParaEditar?.data_adiantamento || '';
  const formaPagamentoAdiantamento = ultimo?.forma_pagamento || servicoParaEditar?.forma_pagamento_adiantamento || 'PIX';

  const adicionarAdiantamento = (item: Omit<AdiantamentoItem, 'id'>) => {
    setAdiantamentosHistorico((prev) => [...prev, { ...item, id: `ad_${Date.now()}_${Math.floor(Math.random() * 1000)}` }]);
  };

  const removerAdiantamento = (id: string) => {
    setAdiantamentosHistorico((prev) => prev.filter((i) => i.id !== id));
  };

  const getDespesasItensMontados = (dataRef: string): DespesaItemServico[] => {
    const itens: DespesaItemServico[] = [];
    if (despesaManutencao > 0) {
      itens.push({
        id: 'desp_manut_principal',
        categoria: 'PECAS_LUBRIFICANTES',
        descricao: descricaoManutencao || 'Peças, Lubrificantes & Manutenção',
        fornecedor: fornecedorManutencao || 'Auto Peças / Distribuidora',
        valor: Number(despesaManutencao),
        data: dataRef,
        forma_pagamento: formaPagamentoManutencao,
        status_pagamento: statusPagamentoManutencao,
        comprovante_url: fotoCupomManutencao
      });
    }
    if (despesaApoio > 0) {
      itens.push({
        id: 'desp_apoio_principal',
        categoria: 'LOGISTICA_APOIO',
        descricao: descricaoApoio || 'Logística / Frete Prancha e Apoio',
        fornecedor: fornecedorApoio || 'Transporte / Logística',
        valor: Number(despesaApoio),
        data: dataRef,
        forma_pagamento: formaPagamentoApoio,
        status_pagamento: statusPagamentoApoio,
        comprovante_url: fotoCupomApoio
      });
    }
    return itens;
  };

  return {
    combustivelMaquinaLitros, setCombustivelMaquinaLitros,
    combustivelMaquinaValor, setCombustivelMaquinaValor,
    combustivelApoioLitros, setCombustivelApoioLitros,
    combustivelApoioValor, setCombustivelApoioValor,
    fotoCupom, setFotoCupom, despesaOperador, setDespesaOperador,
    despesaManutencao, setDespesaManutencao, descricaoManutencao, setDescricaoManutencao,
    fornecedorManutencao, setFornecedorManutencao, formaPagamentoManutencao, setFormaPagamentoManutencao,
    statusPagamentoManutencao, setStatusPagamentoManutencao, fotoCupomManutencao, setFotoCupomManutencao,
    despesaApoio, setDespesaApoio, descricaoApoio, setDescricaoApoio,
    fornecedorApoio, setFornecedorApoio, formaPagamentoApoio, setFormaPagamentoApoio,
    statusPagamentoApoio, setStatusPagamentoApoio, fotoCupomApoio, setFotoCupomApoio,
    abastecimentosIds, setAbastecimentosIds, adiantamentosHistorico, setAdiantamentosHistorico,
    adicionarAdiantamento, removerAdiantamento, valorAdiantamento, dataAdiantamento,
    formaPagamentoAdiantamento, fotosTrabalho, setFotosTrabalho, observacoes, setObservacoes,
    getDespesasItensMontados
  };
}
