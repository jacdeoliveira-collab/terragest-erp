import React from 'react';
import { Modal } from '../../../ui/Modal';
import { Settings, AlertCircle, RefreshCw } from 'lucide-react';
import { useEquipmentHistorico } from '../../../../hooks/useEquipmentHistorico';
import { EquipmentHistoricoHeader } from './EquipmentHistoricoHeader';
import { EquipmentHistoricoTabs } from './EquipmentHistoricoTabs';
import type { Equipment } from '../../../../types/equipment.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onEditarCadastro?: (equipment: Equipment) => void;
}

export const EquipmentHistoricoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  equipment,
  onEditarCadastro
}) => {
  const { data, isLoading, error, refetch } = useEquipmentHistorico(equipment);
  const [activeTab, setActiveTab] = React.useState<'operadores' | 'abastecimentos'>('operadores');

  if (!equipment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ficha 360° & Histórico: ${equipment.code} - ${equipment.name}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10">
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span className="font-mono text-emerald-800">{equipment.code}</span>
              <span>•</span>
              <span>{equipment.name}</span>
              <span className="text-gray-500 font-normal">
                ({equipment.marca ? `${equipment.marca} ` : ''}{equipment.model})
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {equipment.placa ? `Placa: ${equipment.placa}` : `Série: ${equipment.serial_number || '-'}`} | Regime: <strong className="text-gray-800">{equipment.tipo_propriedade}</strong> | Status: <strong className="text-emerald-700">{equipment.status}</strong>
              {equipment.drive_url_foto && (
                <>
                  {' '}| <a href={equipment.drive_url_foto} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline hover:text-emerald-900">Foto no Drive ↗</a>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              title="Atualizar dados"
              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {onEditarCadastro && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditarCadastro(equipment);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-gray-200"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Editar Cadastro</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <EquipmentHistoricoHeader
          equipment={equipment}
          data={data}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {isLoading ? (
          <div className="text-center py-8 text-xs text-gray-400">
            Consolidando telemetria, combustível e operadores...
          </div>
        ) : (
          <EquipmentHistoricoTabs
            data={data}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />
        )}
      </div>
    </Modal>
  );
};
