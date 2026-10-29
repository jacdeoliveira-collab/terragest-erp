import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { useClientes } from '../../../hooks/useClientes';
import { useEquipments } from '../../../hooks/useEquipments';
import { OrcamentoCondicoesPagamentoSection } from './OrcamentoCondicoesPagamentoSection';
import { OrcamentoClienteCard } from './OrcamentoClienteCard';
import { OrcamentoMaquinaCard } from './OrcamentoMaquinaCard';
import { OrcamentoCondicoesOperacionaisSection } from './OrcamentoCondicoesOperacionaisSection';
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Valor da Hora *</label>
          <input type="number" step="0.01" min="0" required value={valorHora} onChange={(e) => setValorHora(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Horas Estimadas *</label>
          <input type="number" step="0.5" min="1" required value={horasEstimadas} onChange={(e) => setHorasEstimadas(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
        </div>
        <div>
          <label className="block font-semibold text-amber-700 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Desconto (R$)</label>
          <input type="number" step="0.01" min="0" value={valorDesconto || ''} placeholder="0.00" onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-amber-50/50 border border-amber-300 rounded-xl font-mono text-amber-800" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Validade (Dias)</label>
          <input type="number" min="1" value={validadeDias} onChange={(e) => setValidadeDias(parseInt(e.target.value) || 15)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
        </div>
      </div>

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

      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="space-x-2 text-[11px] text-gray-600">
          <span>Subtotal: <b>R$ {subtotal.toFixed(2)}</b></span>
          {valorDesconto > 0 && <span className="text-amber-700">| Desconto: <b>(-) R$ {valorDesconto.toFixed(2)}</b></span>}
        </div>
        <span className="font-mono font-bold text-emerald-800 text-sm">
          Total Proposta: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
        <button type="submit" disabled={salvando || !clienteId} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          {salvando ? 'Salvando...' : orcamentoParaEditar ? 'Salvar Alterações' : 'Salvar Proposta'}
        </button>
      </div>
    </form>
  );
};
