import React, { useState } from 'react';
import { Truck, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { Modal } from '../../ui/Modal';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentTableRow } from './EquipmentTableRow';
import { EquipmentHistoricoModal } from './modal/EquipmentHistoricoModal';
import type { Equipment } from '../../../types/equipment.types';
import { exportarFrotaPDF } from '../../../utils/exportOperacionalPdf';
import { exportToExcel } from '../../../services/exportExcel';

export const EquipmentList: React.FC = () => {
  const { data, isLoading, error, refetch, excluirEquipment } = useEquipments();
  const [selectedHistorico, setSelectedHistorico] = useState<Equipment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipmentParaEditar, setEquipmentParaEditar] = useState<Equipment | null>(null);

  const handleCreated = () => {
    setIsFormOpen(false);
    setEquipmentParaEditar(null);
    refetch();
  };

  const handleOpenCreate = () => {
    setEquipmentParaEditar(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEquipmentParaEditar(eq);
    setIsFormOpen(true);
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este equipamento da frota?')) {
      await excluirEquipment(id);
      refetch();
    }
  };

  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">Carregando frota de máquinas...</div>;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Gestão de Frota & Linha Amarela</h2>
          <p className="text-xs text-gray-500">Controle de horímetro, telemetria, edição e cadastro de máquinas</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => exportarFrotaPDF(data)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>
          <button onClick={() => exportToExcel(data, 'Frota_TerraGest')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button onClick={handleOpenCreate} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer ml-1">
            <Plus className="w-4 h-4" />
            <span>Novo Equipamento</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Truck className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum equipamento cadastrado na frota</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">Cadastre escavadeiras, tratores ou caminhões para alocação e controle de custos.</p>
          <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Novo Equipamento</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
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
              {data.map((item: Equipment) => (
                <EquipmentTableRow
                  key={item.id}
                  item={item}
                  onSelect={(eq) => setSelectedHistorico(eq)}
                  onEdit={(eq) => handleOpenEdit(eq)}
                  onDelete={(id) => handleExcluir(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EquipmentHistoricoModal
        isOpen={Boolean(selectedHistorico)}
        onClose={() => setSelectedHistorico(null)}
        equipment={selectedHistorico}
        onEditarCadastro={(eq) => handleOpenEdit(eq)}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEquipmentParaEditar(null); }}
        title={equipmentParaEditar ? `Editar Equipamento: ${equipmentParaEditar.name}` : "Cadastrar Equipamento da Frota"}
      >
        <EquipmentForm
          key={equipmentParaEditar?.id || 'novo'}
          equipamentoId={equipmentParaEditar?.id}
          equipmentParaEditar={equipmentParaEditar}
          onSuccess={handleCreated}
          onCancel={() => { setIsFormOpen(false); setEquipmentParaEditar(null); }}
        />
      </Modal>
    </div>
  );
};
