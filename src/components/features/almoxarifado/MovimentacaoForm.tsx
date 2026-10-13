import React from 'react';
import { AlertCircle, FileText, Package, Scale, Check } from 'lucide-react';
import { useMovimentacaoFormState } from './useMovimentacaoFormState';
import { MovimentacaoDadosTab } from './MovimentacaoDadosTab';
import { MovimentacaoMaterialTab } from './MovimentacaoMaterialTab';
import { MovimentacaoBalancaTab } from './MovimentacaoBalancaTab';

interface MovimentacaoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MovimentacaoForm: React.FC<MovimentacaoFormProps> = ({ onSuccess, onCancel }) => {
  const { state, setters, actions } = useMovimentacaoFormState(onSuccess);

  const tabs = [
    { id: 'dados' as const, label: '1. Tipo & NF', icon: FileText },
    { id: 'material' as const, label: '2. Material & Qtde', icon: Package },
    { id: 'balanca' as const, label: '3. Ticket Balança', icon: Scale }
  ];

  return (
    <form onSubmit={actions.handleSubmit} className="text-left space-y-4">
      {state.error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/70 rounded-xl p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setters.setActiveTab(tab.id)}
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
        {state.activeTab === 'dados' && (
          <MovimentacaoDadosTab
            tipoMovimentacao={state.tipoMovimentacao} setTipoMovimentacao={setters.setTipoMovimentacao}
            data={state.data} setData={setters.setData}
            fornecedorNome={state.fornecedorNome} setFornecedorNome={setters.setFornecedorNome}
            numeroNf={state.numeroNf} setNumeroNf={setters.setNumeroNf}
            valorTotal={state.valorTotal} setValorTotal={setters.setValorTotal}
            gerarContaPagar={state.gerarContaPagar} setGerarContaPagar={setters.setGerarContaPagar}
            observacoes={state.observacoes} setObservacoes={setters.setObservacoes}
            lendoOcr={state.lendoOcr}
            mensagemSucesso={state.mensagemSucesso}
            comprovanteUrl={state.comprovanteUrl}
            onUploadArquivo={actions.handleUploadArquivo}
          />
        )}
        {state.activeTab === 'material' && (
          <MovimentacaoMaterialTab
            materialNome={state.materialNome} setMaterialNome={setters.setMaterialNome}
            unidadeMedida={state.unidadeMedida} setUnidadeMedida={setters.setUnidadeMedida}
            quantidade={state.quantidade} setQuantidade={setters.setQuantidade}
          />
        )}
        {state.activeTab === 'balanca' && (
          <MovimentacaoBalancaTab
            ticketBalancaNumero={state.ticketBalancaNumero} setTicketBalancaNumero={setters.setTicketBalancaNumero}
            pesoBrutoKg={state.pesoBrutoKg} setPesoBrutoKg={setters.setPesoBrutoKg}
            taraKg={state.taraKg} setTaraKg={setters.setTaraKg}
            pesoLiquidoKg={state.pesoLiquidoKg} setPesoLiquidoKg={setters.setPesoLiquidoKg}
            onAplicarQuantidade={(t) => {
              setters.setQuantidade(t);
              setters.setUnidadeMedida('TON');
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={state.isSubmitting || !state.materialNome || !state.quantidade}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
        >
          <Check className="w-4 h-4" />
          <span>{state.isSubmitting ? 'Registrando...' : 'Registrar Movimentação'}</span>
        </button>
      </div>
    </form>
  );
};
