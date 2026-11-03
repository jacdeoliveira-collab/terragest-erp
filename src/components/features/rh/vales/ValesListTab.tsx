import React, { useState } from 'react';
import { DollarSign, Plus, RefreshCw, Search } from 'lucide-react';
import { useValesRh } from '../../../../hooks/useValesRh';
import { ValesCardsResumo } from './ValesCardsResumo';
import { ValesTable } from './ValesTable';
import { LancarValeModal } from './LancarValeModal';

export const ValesListTab: React.FC = () => {
  const { vales, isLoading, refetch, excluir } = useValesRh();
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const valesFiltrados = React.useMemo(() => {
    if (!busca.trim()) return vales;
    const b = busca.toLowerCase();
    return vales.filter((v) =>
      v.colaboradorNome.toLowerCase().includes(b) ||
      (v.observacao && v.observacao.toLowerCase().includes(b))
    );
  }, [vales, busca]);

  return (
    <div className="space-y-4 text-left">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Vales & Haveres de Colaboradores (RH)</h2>
            <p className="text-[11px] text-gray-500">Registro centralizado de adiantamentos com emissão de recibos e baixa financeira</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar colaborador ou motivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-56 text-gray-800"
            />
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setModalNovoAberto(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Vale / Haver</span>
          </button>
        </div>
      </div>

      <ValesCardsResumo vales={valesFiltrados} />

      <ValesTable vales={valesFiltrados} onExcluir={excluir} />

      <LancarValeModal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

