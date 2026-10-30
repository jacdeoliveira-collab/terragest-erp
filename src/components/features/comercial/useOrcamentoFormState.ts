import { useState } from 'react';
import type { Orcamento, CreateOrcamentoDTO, OrcamentoMaquinaItem } from '../../../types/comercial.types';
import type { Equipment } from '../../../types/equipment.types';

function criarMaquinaInicial(orc?: Orcamento | null): OrcamentoMaquinaItem[] {
  if (orc?.detalhes_proposta?.maquinas_itens && orc.detalhes_proposta.maquinas_itens.length > 0) {
    return orc.detalhes_proposta.maquinas_itens;
  }
  const vh = orc?.valor_hora ?? 280;
  const h = orc?.horas_estimadas ?? 40;
  return [{
    id: 'maq_1',
    maquina_id: orc?.maquina_id || '',
    maquina_nome: orc?.maquina_nome || '',
    maquina_codigo: orc?.maquina_codigo || '',
    maquina_modelo: orc?.maquina_modelo || '',
    maquina_ano: orc?.maquina_ano || '',
    maquina_potencia: orc?.maquina_potencia || '',
    maquina_chassi: orc?.maquina_serie || '',
    maquina_horimetro_saida: orc?.maquina_horimetro_atual ?? 0,
    implemento: 'Concha Padrão (Escavação/Carga)',
    operador_nome: '',
    franquia_minima: 'Por Medição de Horímetro (Sem Franquia)',
    horas_estimadas: h,
    valor_hora: vh,
    subtotal: Number((h * vh).toFixed(2))
  }];
}

export function useOrcamentoFormState(
  orcamentoParaEditar: Orcamento | null | undefined,
  equipments: Equipment[],
  onSubmit: (dto: CreateOrcamentoDTO) => Promise<{ success: boolean; error?: string }>,
  onUpdate: ((id: string, dto: Partial<CreateOrcamentoDTO>) => Promise<{ success: boolean; error?: string }>) | undefined,
  onSuccess: () => void
) {
  const det = orcamentoParaEditar?.detalhes_proposta;
  const [clienteId, setClienteId] = useState(orcamentoParaEditar?.cliente_id || '');
  const [maquinasItens, setMaquinasItens] = useState<OrcamentoMaquinaItem[]>(() => criarMaquinaInicial(orcamentoParaEditar));
  const [obraId, setObraId] = useState(det?.obra_id || '');
  const [obraNome, setObraNome] = useState(det?.obra_nome || '');
  const [localObra, setLocalObra] = useState(det?.local_obra || orcamentoParaEditar?.cliente_endereco || '');
  const [tipoOperacao, setTipoOperacao] = useState(det?.tipo_operacao || 'Terraplanagem e Corte/Aterro');
  const [tipoTerreno, setTipoTerreno] = useState(det?.tipo_terreno || 'Solo Comum / Terra Firme (Operação Normal)');
  const [regimeTrabalho, setRegimeTrabalho] = useState(det?.regime_trabalho || 'Turno Diurno Comercial (8h/dia • Seg a Sáb)');
  const [previsaoInicio, setPrevisaoInicio] = useState(det?.previsao_inicio || new Date().toISOString().slice(0, 10));
  const [descricaoServico, setDescricaoServico] = useState(orcamentoParaEditar?.descricao_servico || '');

  const [valorMobilizacao, setValorMobilizacao] = useState<number>(det?.valor_mobilizacao ?? 0);
  const [valorHoraParada, setValorHoraParada] = useState<number>(det?.valor_hora_parada ?? 0);
  const [valorDesconto, setValorDesconto] = useState<number>(det?.valor_desconto ?? 0);
  const [validadeDias, setValidadeDias] = useState<number>(orcamentoParaEditar?.validade_dias ?? 15);

  const [operadorIncluso, setOperadorIncluso] = useState<boolean>(det?.operador_incluso ?? true);
  const [combustivelTermo, setCombustivelTermo] = useState<string>(det?.combustivel_termo || 'Por conta do Contratante (Fornecido na Obra)');
  const [mobilizacaoTermo, setMobilizacaoTermo] = useState<string>(det?.mobilizacao_termo || 'Por conta do Contratante');
  const [alimentacaoTermo, setAlimentacaoTermo] = useState<string>(det?.alimentacao_hospedagem_termo || 'Por conta do Contratante no local da obra');
  const [guardaTermo, setGuardaTermo] = useState<string>(det?.guarda_vigilancia_termo || 'Responsabilidade integral do Contratante no canteiro');
  const [observacoesLivres, setObservacoesLivres] = useState<string>(det?.observacoes_livres || '');

  const [formaPagamento, setFormaPagamento] = useState<string>(orcamentoParaEditar?.forma_pagamento || 'PIX');
  const [condicaoPagamento, setCondicaoPagamento] = useState<string>(orcamentoParaEditar?.condicao_pagamento || 'A_VISTA');
  const [contaBancariaId, setContaBancariaId] = useState<string>(orcamentoParaEditar?.conta_bancaria_id || '');
  const [prazoDescricao, setPrazoDescricao] = useState<string>(orcamentoParaEditar?.prazo_descricao || 'Sinal na aprovação e saldo conforme medição de horímetro');
  const [dataVencimento, setDataVencimento] = useState<string>(orcamentoParaEditar?.data_vencimento || new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const subtotalHoras = Number(maquinasItens.reduce((acc, m) => acc + Number(m.subtotal || 0), 0).toFixed(2));
  const totalHorasEstimadas = Number(maquinasItens.reduce((acc, m) => acc + Number(m.horas_estimadas || 0), 0).toFixed(2));
  const valorHoraMedio = totalHorasEstimadas > 0 ? Number((subtotalHoras / totalHorasEstimadas).toFixed(2)) : (maquinasItens[0]?.valor_hora || 0);
  const valorTotal = Number(Math.max(0, subtotalHoras + valorMobilizacao - valorDesconto).toFixed(2));

  const handleAddMaquina = () => {
    setMaquinasItens((prev) => [...prev, {
      id: `maq_${Date.now()}`, maquina_id: '', maquina_nome: '', implemento: 'Concha Padrão (Escavação/Carga)',
      franquia_minima: 'Por Medição de Horímetro (Sem Franquia)', horas_estimadas: 40, valor_hora: 280, subtotal: 11200
    }]);
  };
  const handleRemoveMaquina = (id: string) => setMaquinasItens((prev) => prev.filter((m) => m.id !== id));
  const handleUpdateMaquina = (id: string, updates: Partial<OrcamentoMaquinaItem>) => {
    setMaquinasItens((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSelectEquipmentFrota = (itemId: string, eqId: string) => {
    const eq = equipments.find((e) => e.id === eqId);
    if (!eq) { handleUpdateMaquina(itemId, { maquina_id: '' }); return; }
    handleUpdateMaquina(itemId, {
      maquina_id: eq.id, maquina_nome: eq.name, maquina_codigo: eq.code, maquina_modelo: eq.model || '',
      maquina_ano: eq.ano_fabricacao || '', maquina_potencia: eq.potencia_hp || '',
      maquina_chassi: eq.serial_number || eq.chassi || eq.placa || '',
      maquina_horimetro_saida: eq.current_hourmeter || 0
    });
    if (!descricaoServico || descricaoServico.startsWith('Locação de')) {
      setDescricaoServico(`Locação de ${eq.name} (${eq.model || eq.code}) para serviços de ${tipoOperacao.toLowerCase()} com medição por horímetro.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !descricaoServico.trim()) return;
    setSalvando(true); setErro(null);
    const primMaq = maquinasItens[0];
    const obsResumo = `[Obra: ${localObra || 'No local'} | Operação: ${tipoOperacao} | Operador: ${operadorIncluso ? 'Incluso' : 'Contratante'} | Diesel: ${combustivelTermo} | Prancha: ${mobilizacaoTermo}] ${observacoesLivres}`.trim();
    const payload: CreateOrcamentoDTO = {
      cliente_id: clienteId, maquina_id: primMaq?.maquina_id || undefined,
      descricao_servico: descricaoServico.trim(), valor_hora: primMaq?.valor_hora || valorHoraMedio,
      horas_estimadas: totalHorasEstimadas, valor_total: valorTotal,
      status: orcamentoParaEditar?.status || 'PENDENTE', validade_dias: Number(validadeDias) || 15,
      observacoes: obsResumo, formaPagamento: undefined, forma_pagamento: formaPagamento,
      condicao_pagamento: condicaoPagamento, conta_bancaria_id: contaBancariaId || undefined,
      prazo_descricao: prazoDescricao.trim() || undefined, data_vencimento: dataVencimento || undefined,
      detalhes_proposta: {
        local_obra: localObra, obra_id: obraId, obra_nome: obraNome, tipo_operacao: tipoOperacao,
        tipo_terreno: tipoTerreno, regime_trabalho: regimeTrabalho, previsao_inicio: previsaoInicio,
        valor_mobilizacao: valorMobilizacao, valor_hora_parada: valorHoraParada, valor_desconto: valorDesconto,
        operador_incluso: operadorIncluso, combustivel_termo: combustivelTermo, mobilizacao_termo: mobilizacaoTermo,
        alimentacao_hospedagem_termo: alimentacaoTermo, guarda_vigilancia_termo: guardaTermo,
        observacoes_livres: observacoesLivres, maquinas_itens: maquinasItens
      }
    } as CreateOrcamentoDTO;

    const res = (orcamentoParaEditar && onUpdate) ? await onUpdate(orcamentoParaEditar.id, payload) : await onSubmit(payload);
    setSalvando(false);
    if (res.success) onSuccess();
    else setErro(res.error || 'Erro ao salvar proposta comercial');
  };

  return {
    clienteId, setClienteId, maquinasItens, obraId, setObraId, obraNome, setObraNome,
    localObra, setLocalObra, tipoOperacao, setTipoOperacao, tipoTerreno, setTipoTerreno,
    regimeTrabalho, setRegimeTrabalho, previsaoInicio, setPrevisaoInicio, descricaoServico, setDescricaoServico,
    valorMobilizacao, setValorMobilizacao, valorHoraParada, setValorHoraParada, valorDesconto, setValorDesconto,
    validadeDias, setValidadeDias, operadorIncluso, setOperadorIncluso, combustivelTermo, setCombustivelTermo,
    mobilizacaoTermo, setMobilizacaoTermo, alimentacaoTermo, setAlimentacaoTermo, guardaTermo, setGuardaTermo,
    observacoesLivres, setObservacoesLivres, formaPagamento, setFormaPagamento, condicaoPagamento, setCondicaoPagamento,
    contaBancariaId, setContaBancariaId, prazoDescricao, setPrazoDescricao, dataVencimento, setDataVencimento,
    salvando, erro, subtotalHoras, valorTotal,
    handleAddMaquina, handleRemoveMaquina, handleUpdateMaquina, handleSelectEquipmentFrota, handleSubmit
  };
}

