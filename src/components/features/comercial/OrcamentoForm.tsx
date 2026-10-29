import React, { useState } from 'react';
import { useClientes } from '../../../hooks/useClientes';
import { useEquipments } from '../../../hooks/useEquipments';
import { OrcamentoCondicoesPagamentoSection } from './OrcamentoCondicoesPagamentoSection';
import { OrcamentoClienteCard } from './OrcamentoClienteCard';
import { OrcamentoMaquinaCard } from './OrcamentoMaquinaCard';
import { OrcamentoCondicoesOperacionaisSection } from './OrcamentoCondicoesOperacionaisSection';
import { OrcamentoValoresSection } from './OrcamentoValoresSection';
import { OrcamentoFormFooter } from './OrcamentoFormFooter';
import type { Orcamento, CreateOrcamentoDTO } from '../../../types/comercial.types';

interface OrcamentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (dto: CreateOrcamentoDTO) => Promise<{ success: boolean; error?: string }>;
  orcamentoParaEditar?: Orcamento | null;
  onUpdate?: (id: string, dto: Partial<CreateOrcamentoDTO>) => Promise<{ success: boolean; error?: string }>;
}

export const OrcamentoForm: React.FC<OrcamentoFormProps> = ({
  onSuccess, onCancel, onSubmit, orcamentoParaEditar, onUpdate
}) => {
  const { clientes } = useClientes();
  const { data: equipments } = useEquipments({ onlyActives: true });

  const [clienteId, setClienteId] = useState(orcamentoParaEditar?.cliente_id || '');
  const [maquinaId, setMaquinaId] = useState(orcamentoParaEditar?.maquina_id || '');
  const [descricaoServico, setDescricaoServico] = useState(orcamentoParaEditar?.descricao_servico || '');
  const [valorHora, setValorHora] = useState<number>(orcamentoParaEditar?.valor_hora ?? 250);
  const [horasEstimadas, setHorasEstimadas] = useState<number>(orcamentoParaEditar?.horas_estimadas ?? 40);
  const [valorDesconto, setValorDesconto] = useState<number>(0);
  const [validadeDias, setValidadeDias] = useState<number>(orcamentoParaEditar?.validade_dias ?? 15);
  const [operadorIncluso, setOperadorIncluso] = useState<boolean>(true);
  const [combustivelTermo, setCombustivelTermo] = useState<string>('Por conta do Contratante');
  const [mobilizacaoTermo, setMobilizacaoTermo] = useState<string>('Por conta do Contratante');
  const [formaPagamento, setFormaPagamento] = useState<string>(orcamentoParaEditar?.forma_pagamento || 'PIX');
  const [condicaoPagamento, setCondicaoPagamento] = useState<string>(orcamentoParaEditar?.condicao_pagamento || 'A_VISTA');
  const [contaBancariaId, setContaBancariaId] = useState<string>(orcamentoParaEditar?.conta_bancaria_id || '');
  const [prazoDescricao, setPrazoDescricao] = useState<string>(orcamentoParaEditar?.prazo_descricao || 'À vista na aprovação / liberação da máquina');
  const [dataVencimento, setDataVencimento] = useState<string>(orcamentoParaEditar?.data_vencimento || new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const subtotal = Number((valorHora * horasEstimadas).toFixed(2));
  const valorTotal = Number(Math.max(0, subtotal - valorDesconto).toFixed(2));
  const clienteSelecionado = (clientes || []).find((c) => c.id === clienteId);
  const maquinaSelecionada = (equipments || []).find((eq) => eq.id === maquinaId);

  const handleSelectMaquina = (id: string) => {
    setMaquinaId(id);
    const m = (equipments || []).find((eq) => eq.id === id);
    if (m && (!descricaoServico || descricaoServico.startsWith('Locação de'))) {
      setDescricaoServico(`Locação de ${m.name} (${m.model || m.code}) com medição por horímetro`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !descricaoServico.trim()) return;
    setSalvando(true);
    setErro(null);

    const descNota = valorDesconto > 0 ? ` [Desconto: R$ ${valorDesconto.toFixed(2)}]` : '';
    const obsOperacional = `[Termos: Operador: ${operadorIncluso ? 'Incluso' : 'Contratante'} | Diesel: ${combustivelTermo} | Frete/Prancha: ${mobilizacaoTermo}]`;
    const payload: CreateOrcamentoDTO = {
      cliente_id: clienteId,
      maquina_id: maquinaId || undefined,
      descricao_servico: descricaoServico.trim(),
      valor_hora: Number(valorHora),
      horas_estimadas: Number(horasEstimadas),
      valor_total: valorTotal,
      status: orcamentoParaEditar?.status || 'PENDENTE',
      validade_dias: Number(validadeDias) || 15,
      observacoes: obsOperacional,
      forma_pagamento: formaPagamento,
      condicao_pagamento: condicaoPagamento,
      conta_bancaria_id: contaBancariaId || undefined,
      prazo_descricao: (prazoDescricao.trim() + descNota).trim() || undefined,
      data_vencimento: dataVencimento || undefined
    };

    const res = (orcamentoParaEditar && onUpdate) ? await onUpdate(orcamentoParaEditar.id, payload) : await onSubmit(payload);
    setSalvando(false);
    if (res.success) onSuccess();
    else setErro(res.error || 'Erro ao salvar proposta');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs text-left max-h-[78vh] overflow-y-auto pr-1">
      {erro && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{erro}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Cliente Contratante *</label>
          <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl">
            <option value="">Selecione o Cliente</option>
            {(clientes || []).map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Máquina / Equipamento da Frota</label>
          <select value={maquinaId} onChange={(e) => handleSelectMaquina(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl">
            <option value="">Locação Geral de Linha Amarela</option>
            {(equipments || []).map((eq) => (<option key={eq.id} value={eq.id}>{eq.code} - {eq.name} ({eq.model || 'Linha Amarela'})</option>))}
          </select>
        </div>
      </div>

      <OrcamentoClienteCard cliente={clienteSelecionado} />
      <OrcamentoMaquinaCard equipment={maquinaSelecionada} />

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Escopo do Serviço / Locação *</label>
        <textarea required rows={2} placeholder="Ex: Terraplanagem, drenagem pluvial ou escavação de valas" value={descricaoServico} onChange={(e) => setDescricaoServico(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
      </div>

      <OrcamentoValoresSection
        valorHora={valorHora} setValorHora={setValorHora}
        horasEstimadas={horasEstimadas} setHorasEstimadas={setHorasEstimadas}
        valorDesconto={valorDesconto} setValorDesconto={setValorDesconto}
        validadeDias={validadeDias} setValidadeDias={setValidadeDias}
      />

      <OrcamentoCondicoesOperacionaisSection
        operadorIncluso={operadorIncluso} setOperadorIncluso={setOperadorIncluso}
        combustivelTermo={combustivelTermo} setCombustivelTermo={setCombustivelTermo}
        mobilizacaoTermo={mobilizacaoTermo} setMobilizacaoTermo={setMobilizacaoTermo}
      />

      <OrcamentoCondicoesPagamentoSection
        formaPagamento={formaPagamento} setFormaPagamento={setFormaPagamento}
        condicaoPagamento={condicaoPagamento} setCondicaoPagamento={setCondicaoPagamento}
        contaBancariaId={contaBancariaId} setContaBancariaId={setContaBancariaId}
        prazoDescricao={prazoDescricao} setPrazoDescricao={setPrazoDescricao}
        dataVencimento={dataVencimento} setDataVencimento={setDataVencimento}
      />

      <OrcamentoFormFooter
        subtotal={subtotal}
        valorDesconto={valorDesconto}
        valorTotal={valorTotal}
        salvando={salvando}
        clienteId={clienteId}
        isEdicao={Boolean(orcamentoParaEditar)}
        onCancel={onCancel}
      />
    </form>
  );
};
