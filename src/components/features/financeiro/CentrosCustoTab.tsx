import React, { useState } from 'react';
import { Building2, Search, Plus, Pencil, Trash2, Calendar, Sprout } from 'lucide-react';
import { useCentrosCusto } from '../../../hooks/useCentrosCusto';
import { CentroCustoFormModal } from './CentroCustoFormModal';
import { CentroCustoDrePanel } from './CentroCustoDrePanel';
import type { CentroCusto } from '../../../types/centroCusto.types';

export const CentrosCustoTab: React.FC = () => {
  const { centrosCusto, loading, isSubmitting, salvarCentroCusto, excluirCentroCusto } = useCentrosCusto();
  const [selectedId, setSelectedId] = useState<string>('');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [filtroSafra, setFiltroSafra] = useState<string>('');
  const [filtroData, setFiltroData] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CentroCusto | null>(null);

  const safras = Array.from(new Set(centrosCusto.map((c) => c.ano_safra?.trim()).filter((s): s is string => Boolean(s)))).sort().reverse();

  const filtrados = centrosCusto.filter((c) => {
    const busca = termoBusca.toLowerCase();
    const matchBusca = c.nome.toLowerCase().includes(busca) || (c.localizacao || '').toLowerCase().includes(busca) || (c.cliente || '').toLowerCase().includes(busca);
    const matchSafra = !filtroSafra || c.ano_safra === filtroSafra;
    const dt = c.data_registro || c.data_inicio || '';
    const matchData = !filtroData || dt === filtroData;
    return matchBusca && matchSafra && matchData;
  });

  const activeId = selectedId && filtrados.some((c) => c.id === selectedId) ? selectedId : (filtrados[0]?.id || '');
  const centroAtivo = centrosCusto.find((c) => c.id === activeId);

  const handleOpenNovo = () => { setEditingItem(null); setModalOpen(true); };
  const handleOpenEditar = (item: CentroCusto) => { setEditingItem(item); setModalOpen(true); };
  const handleExcluir = async (item: CentroCusto) => {
    if (window.confirm(`Excluir o centro de custo "${item.nome}"?`)) await excluirCentroCusto(item.id);
  };

  return (
    <div className="space-y-5 text-left">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Centros de Custo & Ano Safra</h2>
              <p className="text-xs text-gray-500">Cadastro enxuto de centros de custo por data e ano safra com DRE operacional</p>
            </div>
          </div>
          <button type="button" onClick={handleOpenNovo} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">
            <Plus className="w-4 h-4" /><span>Novo Centro de Custo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar centro de custo ou descrição..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl" />
          </div>
          <select value={filtroSafra} onChange={(e) => setFiltroSafra(e.target.value)} className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl">
            <option value="">Todas as Safras</option>
            {safras.map((s) => <option key={s} value={s}>Safra {s}</option>)}
          </select>
          <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl" />
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                <th className="py-2.5 px-3">Centro de Custo</th>
                <th className="py-2.5 px-3">Descrição / Local</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Ano Safra</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">Carregando centros de custo...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">Nenhum centro de custo encontrado.</td></tr>
              ) : filtrados.map((item) => {
                const isSelected = item.id === activeId;
                const dt = item.data_registro || item.data_inicio || '-';
                return (
                  <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-gray-50'}`}>
                    <td className="py-2.5 px-3 text-gray-900 font-bold">{item.nome}</td>
                    <td className="py-2.5 px-3 text-gray-600">{item.localizacao || item.cliente || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-700"><span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{dt}</span></td>
                    <td className="py-2.5 px-3">
                      {item.ano_safra ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px] font-bold">
                          <Sprout className="w-3 h-3 text-amber-600" />{item.ano_safra}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => handleOpenEditar(item)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleExcluir(item)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeId && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <CentroCustoDrePanel centroId={activeId} nomeCentro={centroAtivo?.nome} />
        </div>
      )}

      <CentroCustoFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialData={editingItem} isSubmitting={isSubmitting} onSave={salvarCentroCusto} />
    </div>
  );
};
