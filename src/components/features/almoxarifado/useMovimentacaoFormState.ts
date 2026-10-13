import { useState } from 'react';
import { useCreateMovimentacao } from '../../../hooks/useCreateMovimentacao';
import { useAlmoxarifadoOcrReader } from './useAlmoxarifadoOcrReader';
import type { TipoMovimentacaoAlmoxarifado, UnidadeMedidaMaterial } from '../../../types/almoxarifado.types';

export function useMovimentacaoFormState(onSuccess: () => void) {
  const { createMovimentacao, isSubmitting, error, limparErro } = useCreateMovimentacao();

  const [activeTab, setActiveTab] = useState<'dados' | 'material' | 'balanca'>('dados');
  const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacaoAlmoxarifado>('ENTRADA');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [numeroNf, setNumeroNf] = useState('');
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [gerarContaPagar, setGerarContaPagar] = useState<boolean>(true);
  const [observacoes, setObservacoes] = useState('');
  const [materialNome, setMaterialNome] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedidaMaterial>('TON');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [ticketBalancaNumero, setTicketBalancaNumero] = useState('');
  const [pesoBrutoKg, setPesoBrutoKg] = useState<number>(0);
  const [taraKg, setTaraKg] = useState<number>(0);
  const [pesoLiquidoKg, setPesoLiquidoKg] = useState<number>(0);

  const { comprovanteUrl, lendoOcr, mensagemSucesso, handleUploadArquivo } = useAlmoxarifadoOcrReader({
    onDadosExtraidos: (dados) => {
      if (dados.tipoMovimentacao) setTipoMovimentacao(dados.tipoMovimentacao);
      if (dados.data) setData(dados.data);
      if (dados.fornecedorNome) setFornecedorNome(dados.fornecedorNome);
      if (dados.numeroNf) setNumeroNf(dados.numeroNf);
      if (dados.valorTotal) {
        setValorTotal(dados.valorTotal);
        setGerarContaPagar(true);
      }
      if (dados.materialNome) setMaterialNome(dados.materialNome);
      if (dados.unidadeMedida) setUnidadeMedida(dados.unidadeMedida);
      if (dados.quantidade) setQuantidade(dados.quantidade);
      if (dados.ticketBalancaNumero) setTicketBalancaNumero(dados.ticketBalancaNumero);
      if (dados.pesoBrutoKg) setPesoBrutoKg(dados.pesoBrutoKg);
      if (dados.taraKg) setTaraKg(dados.taraKg);
      if (dados.pesoLiquidoKg) setPesoLiquidoKg(dados.pesoLiquidoKg);
      if (dados.observacoes) setObservacoes(dados.observacoes);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const obsFinal = comprovanteUrl
      ? `${observacoes ? observacoes + ' ' : ''}[FOTO:${comprovanteUrl}]`
      : observacoes;

    const result = await createMovimentacao({
      tipo_movimentacao: tipoMovimentacao,
      data,
      fornecedor_nome: fornecedorNome,
      numero_nf: numeroNf,
      valor_total: valorTotal || undefined,
      gerarContaPagar,
      material_nome: materialNome,
      unidade_medida: unidadeMedida,
      quantidade,
      ticket_balanca_numero: ticketBalancaNumero,
      peso_bruto_kg: pesoBrutoKg || undefined,
      tara_kg: taraKg || undefined,
      peso_liquido_kg: pesoLiquidoKg || undefined,
      observacoes: obsFinal
    });

    if (result.success) onSuccess();
  };

  return {
    state: {
      activeTab, tipoMovimentacao, data, fornecedorNome, numeroNf, valorTotal, gerarContaPagar,
      observacoes, materialNome, unidadeMedida, quantidade, ticketBalancaNumero,
      pesoBrutoKg, taraKg, pesoLiquidoKg, comprovanteUrl, lendoOcr, mensagemSucesso,
      isSubmitting, error
    },
    setters: {
      setActiveTab, setTipoMovimentacao, setData, setFornecedorNome, setNumeroNf,
      setValorTotal, setGerarContaPagar, setObservacoes, setMaterialNome, setUnidadeMedida,
      setQuantidade, setTicketBalancaNumero, setPesoBrutoKg, setTaraKg, setPesoLiquidoKg
    },
    actions: { handleSubmit, handleUploadArquivo }
  };
}
