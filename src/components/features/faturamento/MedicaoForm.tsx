import React, { useState } from 'react';
import { AlertCircle, Calendar, DollarSign, ReceiptText, Check } from 'lucide-react';
import { useObraContext } from '../../../contexts/ObraContext';
import { useFaturamento } from '../../../hooks/useFaturamento';
import { useProducaoMedicao, textoProducao } from '../../../hooks/useProducaoMedicao';
import { MedicaoProducaoInfo } from './MedicaoProducaoInfo';
import { MedicaoFiltroTab } from './MedicaoFiltroTab';
import { MedicaoResumoTab } from './MedicaoResumoTab';
import { MedicaoPagamentoTab } from './MedicaoPagamentoTab';

interface MedicaoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MedicaoForm: React.FC<MedicaoFormProps> = ({ onSuccess, onCancel }) => {
  const { obraSelecionada } = useObraContext();
  const { bdesElegiveis, carregandoBDEs, salvando, error, limparErro, buscarBDEsParaMedicao, criarMedicao } = useFaturamento();
  const { producao, buscarProducao } = useProducaoMedicao();

  const [activeTab, setActiveTab] = useState<'filtro' | 'resumo' | 'pagamento'>('filtro');
  const [obraId, setObraId] = useState(obraSelecionada?.id || '');
  const [competencia, setCompetencia] = useState(new Date().toISOString().slice(0, 7));
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 10));
  
  const vencDefault = new Date();
  vencDefault.setDate(vencDefault.getDate() + 30);
  const [dataVencimento, setDataVencimento] = useState(vencDefault.toISOString().slice(0, 10));
  const [numeroMedicao, setNumeroMedicao] = useState(`MED-${competencia.replace('-', '')}-001`);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  const handleBuscar = async () => {
    limparErro();
    const [lista] = await Promise.all([buscarBDEsParaMedicao(obraId, competencia), buscarProducao(obraId, competencia)]);
    const soma = lista.reduce((acc, b) => acc + b.subtotal_calculado, 0);
    setValorTotal(soma);
    if (lista.length > 0) setActiveTab('resumo');
  };

  const totalHoras = bdesElegiveis.reduce((acc, b) => acc + b.horas_produtivas, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    if (bdesElegiveis.length === 0) {
      setActiveTab('filtro');
      return alert('Nenhum BDE aprovado para incluir na medição.');
    }

    const res = await criarMedicao({
      obra_id: obraId,
      competencia,
      numero_medicao: numeroMedicao,
      data_emissao: dataEmissao,
      data_vencimento: dataVencimento,
      total_horas_produtivas: totalHoras,
      valor_total: valorTotal,
      status_pagamento: 'AGUARDANDO_PAGAMENTO',
      observacoes: [observacoes, textoProducao(producao)].filter(Boolean).join(' | '),
      bde_ids: bdesElegiveis.map((b) => b.id)
    });

    if (res.success) onSuccess();
  };

  const tabs = [
    { id: 'filtro' as const, label: '1. Filtro & Obra', icon: Calendar },
    { id: 'resumo' as const, label: '2. Horas & Valores', icon: DollarSign },
    { id: 'pagamento' as const, label: '3. Faturamento & Prazos', icon: ReceiptText }
  ];

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex border-b border-gray-200 bg-gray-50/70 rounded-xl p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[220px]">
        {activeTab === 'filtro' && (
          <MedicaoFiltroTab
            obraId={obraId} setObraId={setObraId}
            competencia={competencia} setCompetencia={setCompetencia}
            onBuscar={handleBuscar} carregando={carregandoBDEs}
            totalBdesEncontrados={bdesElegiveis.length}
          />
        )}
        {activeTab === 'resumo' && <MedicaoProducaoInfo producao={producao} />}
        {activeTab === 'resumo' && (
          <MedicaoResumoTab
            bdes={bdesElegiveis} totalHoras={totalHoras}
            valorTotal={valorTotal} setValorTotal={setValorTotal}
          />
        )}
        {activeTab === 'pagamento' && (
          <MedicaoPagamentoTab
            numeroMedicao={numeroMedicao} setNumeroMedicao={setNumeroMedicao}
            dataEmissao={dataEmissao} setDataEmissao={setDataEmissao}
            dataVencimento={dataVencimento} setDataVencimento={setDataVencimento}
            observacoes={observacoes} setObservacoes={setObservacoes}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando || bdesElegiveis.length === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
        >
          <Check className="w-4 h-4" />
          <span>{salvando ? 'Processando Medição...' : 'Gerar Medição'}</span>
        </button>
      </div>
    </form>
  );
};
