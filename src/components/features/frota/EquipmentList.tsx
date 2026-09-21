import React, { useState } from 'react';
import { Truck, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { Modal } from '../../ui/Modal';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentTableRow } from './EquipmentTableRow';
import type { Equipment } from '../../../types/equipment.types';

export const EquipmentList: React.FC = () => {
  const { data, isLoading, error, refetch } = useEquipments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportPDF = () => {
    console.log('Exportar para PDF', data);
  };

  const handleExportExcel = () => {
    console.log('Exportar para Excel', data);
  };

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando frota de máquinas e equipamentos...
      </div>
    );
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Listagem de Equipamentos</h2>
          <p className="text-xs text-gray-500">Maquinário pesado, implementos e drones cadastrados</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Exportar para PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar para Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Máquina</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum equipamento cadastrado na frota</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">
            Adicione tratores, escavadeiras, pás carregadeiras ou geradores para iniciar os apontamentos.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Máquina</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Nome / Descrição</th>
                <th className="p-3.5">Modelo</th>
                <th className="p-3.5">Nº de Série</th>
                <th className="p-3.5">Chassi</th>
                <th className="p-3.5">Renavam</th>
                <th className="p-3.5 text-right">Horímetro Atual</th>
                <th className="p-3.5 text-center">Foto/Doc</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: Equipment) => (
                <EquipmentTableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Equipamento">
        <EquipmentForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
