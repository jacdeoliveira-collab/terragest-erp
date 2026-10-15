import { useState } from 'react';
import type { Equipment } from '../../../../types/equipment.types';
import type { FormaPagamentoDespesa } from '../../../../types/contasPagar.types';
import type { TipoCombustivel } from '../../../../types/abastecimento.types';
import type { DadosCupomExtraidos } from '../../../../services/cupomParserLocal';
import { processarLancamentoCupom } from '../../../../services/cupomCombustivelService';

interface Props {
  equipments: Equipment[];
  onSuccess: () => void;
  onClose: () => void;
}

export function useCupomFormState({ equipments, onSuccess, onClose }: Props) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [postoFornecedor, setPostoFornecedor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDespesa>('PIX');
  const [statusPagamento, setStatusPagamento] = useState<'PAGO' | 'PENDENTE'>('PAGO');
  const [contaSaida, setContaSaida] = useState('Caixa da Obra');
  const [obraId, setObraId] = useState('');
  const [servicoId, setServicoId] = useState('');

  const [maquinaId, setMaquinaId] = useState('');
  const [horimetro, setHorimetro] = useState<number>(0);
  const [tipoCombMaq, setTipoCombMaq] = useState<TipoCombustivel>('DIESEL_S500');
  const [litrosMaq, setLitrosMaq] = useState<number>(0);
  const [valorMaq, setValorMaq] = useState<number>(0);

  const [incluirApoio, setIncluirApoio] = useState(false);
  const [veiculoApoioId, setVeiculoApoioId] = useState('');
  const [kmApoio, setKmApoio] = useState<number>(0);
  const [tipoCombApoio, setTipoCombApoio] = useState<TipoCombustivel>('DIESEL_S10');
  const [litrosApoio, setLitrosApoio] = useState<number>(0);
  const [valorApoio, setValorApoio] = useState<number>(0);

  const [numeroDoc, setNumeroDoc] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const aplicarDadosExtraidos = (dados: DadosCupomExtraidos) => {
    if (dados.data) setData(dados.data);
    if (dados.postoFornecedor) setPostoFornecedor(dados.postoFornecedor);
    if (dados.formaPagamento) setFormaPagamento(dados.formaPagamento);
    if (dados.numeroDocumento) setNumeroDoc(dados.numeroDocumento);

    if (dados.itens && dados.itens.length > 1) {
      const itMaq = dados.itens.find((it) => it.tipo === 'DIESEL_S500') || dados.itens[0];
      const itApoio = dados.itens.find((it) => it.tipo === 'DIESEL_S10') || dados.itens[1];
      setTipoCombMaq(itMaq.tipo);
      setLitrosMaq(itMaq.litros || 0);
      setValorMaq(itMaq.valorTotal || 0);

      setIncluirApoio(true);
      setTipoCombApoio(itApoio.tipo);
      setLitrosApoio(itApoio.litros || 0);
      setValorApoio(itApoio.valorTotal || 0);
    } else if (dados.itens && dados.itens.length === 1) {
      const it = dados.itens[0];
      setTipoCombMaq(it.tipo);
      setLitrosMaq(it.litros || 0);
      setValorMaq(it.valorTotal || 0);
    } else {
      if (dados.tipoCombustivel) setTipoCombMaq(dados.tipoCombustivel);
      if (dados.litros) setLitrosMaq(dados.litros);
      if (dados.valorTotal) setValorMaq(dados.valorTotal);
    }
  };

  const salvar = async (fotoCupomUrl?: string) => {
    if (!maquinaId || litrosMaq <= 0 || valorMaq <= 0) {
      setErro('Selecione a máquina e preencha litros e valor.');
      return;
    }
    setSalvando(true);
    setErro(null);

    const maqEq = equipments.find((eq) => eq.id === maquinaId);
    const apoioEq = equipments.find((eq) => eq.id === veiculoApoioId);

    const res = await processarLancamentoCupom({
      data, postoFornecedor, formaPagamento, statusPagamento, contaSaida,
      numeroNfCupom: numeroDoc || undefined,
      obraId: obraId || undefined, servicoId: servicoId || undefined,
      fotoCupomUrl: fotoCupomUrl || undefined,
      maquinaPrincipal: {
        maquinaId, maquinaNome: maqEq ? `${maqEq.code} - ${maqEq.name}` : undefined,
        horimetro, tipoCombustivel: tipoCombMaq, quantidadeLitros: litrosMaq, valorTotal: valorMaq
      },
      veiculoApoio: incluirApoio && veiculoApoioId ? {
        maquinaId: veiculoApoioId, maquinaNome: apoioEq ? `${apoioEq.code} - ${apoioEq.name}` : undefined,
        horimetro: kmApoio,
        tipoCombustivel: tipoCombApoio, quantidadeLitros: litrosApoio, valorTotal: valorApoio
      } : undefined
    });

    setSalvando(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErro(res.error || 'Erro ao lançar cupom');
    }
  };

  return {
    data, setData, postoFornecedor, setPostoFornecedor, formaPagamento, setFormaPagamento,
    statusPagamento, setStatusPagamento, contaSaida, setContaSaida, obraId, setObraId,
    servicoId, setServicoId, maquinaId, setMaquinaId, horimetro, setHorimetro,
    tipoCombMaq, setTipoCombMaq, litrosMaq, setLitrosMaq, valorMaq, setValorMaq,
    incluirApoio, setIncluirApoio, veiculoApoioId, setVeiculoApoioId, kmApoio, setKmApoio,
    tipoCombApoio, setTipoCombApoio, litrosApoio, setLitrosApoio, valorApoio, setValorApoio,
    numeroDoc, setNumeroDoc, salvando, erro, setErro, aplicarDadosExtraidos, salvar
  };
}
