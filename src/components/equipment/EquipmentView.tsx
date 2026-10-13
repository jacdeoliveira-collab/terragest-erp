import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEquipment } from '../../hooks/useEquipment';
import { EquipmentCard } from './EquipmentCard';
import { EquipmentForm } from '../features/frota/EquipmentForm';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToExcel } from '../../services/exportExcel';
import { ExportActions } from '../common/ExportActions';

export const EquipmentView: React.FC = () => {
  const { equipment, loading, error } = useEquipment();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(equipment as unknown as Record<string, unknown>[], 'Frota_Equipamentos_TerraGest', 'Equipamentos');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Inventário de Frotas & Linha Amarela</h3>
          <p className="text-xs text-slate-400">Gerenciamento de tratores, escavadeiras, pás carregadeiras e caminhões basculantes</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportActions
            onExportPDF={() => {}} // Reservado para relatórios detalhados ou impressão
            onExportExcel={handleExportExcel}
            disabled={equipment.length === 0}
          />
          <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Novo Equipamento
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando frota do banco de dados...</div>
      ) : error ? (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-sm">{error}</div>
      ) : equipment.length === 0 ? (
        <EmptyState
          title="Nenhum equipamento cadastrado"
          description="Cadastre tratores de esteira, escavadeiras hidráulicas, pás carregadeiras e caminhões da frota."
          actionLabel="Cadastrar Primeiro Equipamento"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Equipamento">
        <EquipmentForm
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
