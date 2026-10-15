import React, { useState, useMemo } from 'react';
import { Truck, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { Modal } from '../../ui/Modal';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentTableRow } from './EquipmentTableRow';
import { EquipmentHistoricoModal } from './modal/EquipmentHistoricoModal';
import { ListFilterBar, type StatusFiltroOpcao } from '../../common/ListFilterBar';
import type { Equipment } from '../../../types/equipment.types';
import { exportarFrotaPDF } from '../../../utils/exportOperacionalPdf';
import { exportarFrotaExcel } from '../../../services/exportExcel';

export const EquipmentList: React.FC = () => {
  const { data, isLoading, error, refetch, excluirEquipment } = useEquipments();
  const [selectedHistorico, setSelectedHistorico] = useState<Equipment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipmentParaEditar, setEquipmentParaEditar] = useState<Equipment | null>(null);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');

  const filteredData = useMemo(() => {
    return data.filter((eq) => {
      if (statusFiltro !== 'TODOS' && String(eq.status) !== statusFiltro) return false;
      if (busca.trim()) {
        const t = busca.toLowerCase().trim();
        const texto = [eq.code, eq.name, eq.marca, eq.model, eq.placa, eq.type].filter(Boolean).join(' ').toLowerCase();
        if (!texto.includes(t)) return false;
      }
      return true;
    });
  }, [data, busca, statusFiltro]);

  const statusOpcoes: StatusFiltroOpcao[] = [
    { id: 'TODOS', label: 'Todos', count: data.length },
    { id: 'AVAILABLE', label: 'Operando / Ativos', count: data.filter((e) => e.status === 'AVAILABLE' || e.status === 'IN_OPERATION').length, badgeClass: 'bg-emerald-100 text-emerald-800' },
    { id: 'MAINTENANCE', label: 'Manutenção', count: data.filter((e) => e.status === 'MAINTENANCE').length, badgeClass: 'bg-amber-100 text-amber-800' }
  ];

  const handleExcluir = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este equipamento da frota?')) {
      await excluirEquipment(id);
      refetch();
    }
  };

  if (isLoading && data.length === 0) return <div className="p-12 text-center text-sm text-gray-400">Carregando frota de máquinas...</div>;

  return (
    <div className="space-y-3.5 text-left text-xs">
      <ListFilterBar
        busca={busca} onBuscaChange={setBusca}
        placeholder="Buscar máquina por código, nome, placa, modelo..."
        statusOpcoes={statusOpcoes} statusAtivo={statusFiltro} onStatusChange={setStatusFiltro}
        onExportarPdf={() => exportarFrotaPDF(filteredData)} exportarLabel="Exportar PDF"
        onExportarExcel={() => exportarFrotaExcel(filteredData)} labelExportarExcel="Exportar Excel"
        temFiltroAtivo={!!busca || statusFiltro !== 'TODOS'} onLimpar={() => { setBusca(''); setStatusFiltro('TODOS'); }}
      />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-600" />Gestão de Frota & Linha Amarela ({filteredData.length})</h2>
            <p className="text-[11px] text-gray-500">Controle de horímetro, telemetria, laudos e status de máquinas</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportarFrotaExcel(filteredData)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold shadow-2xs cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
            </button>
            <button onClick={() => { setEquipmentParaEditar(null); setIsFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer">
              <Plus className="w-4 h-4" /><span>Novo Equipamento</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" /><span>{error}</span>
          </div>
        )}

        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhum equipamento encontrado com os filtros aplicados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200 text-[11px]">
                <tr>
                  <th className="p-3.5">Código / Tipo</th>
                  <th className="p-3.5">Identificação & Placa</th>
                  <th className="p-3.5 text-center">Regime de Posse</th>
                  <th className="p-3.5 text-right">Horímetro / KM</th>
                  <th className="p-3.5 text-center">Laudo ART / NR-12</th>
                  <th className="p-3.5 text-center">Documento</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredData.map((e) => (
                  <EquipmentTableRow key={e.id} item={e} onSelect={setSelectedHistorico} onEdit={(eq) => { setEquipmentParaEditar(eq); setIsFormOpen(true); }} onDelete={handleExcluir} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEquipmentParaEditar(null); }} title={equipmentParaEditar ? 'Editar Equipamento' : 'Novo Equipamento'} maxWidth="3xl">
          <EquipmentForm equipmentParaEditar={equipmentParaEditar} onSuccess={() => { setIsFormOpen(false); setEquipmentParaEditar(null); refetch(); }} onCancel={() => { setIsFormOpen(false); setEquipmentParaEditar(null); }} />
        </Modal>
        {selectedHistorico && <EquipmentHistoricoModal isOpen={Boolean(selectedHistorico)} onClose={() => setSelectedHistorico(null)} equipment={selectedHistorico} />}
      </div>
    </div>
  );
};
