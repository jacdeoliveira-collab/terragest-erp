import React, { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { useCreateEquipment } from '../../../../hooks/useCreateEquipment';
import type { EquipmentCategory } from '../../../../types/equipment.types';
import { getMeasurementLabel, isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';

interface NovoEquipamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (maquinaFormatada: string) => void;
}

export const NovoEquipamentoModal: React.FC<NovoEquipamentoModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { createEquipment, isSubmitting, error } = useCreateEquipment();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('HEAVY_MACHINERY');
  const [currentHourmeter, setCurrentHourmeter] = useState<string>('0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || isSubmitting) return;

    const res = await createEquipment({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      model: model.trim() || name.trim(),
      serial_number: `S/N-${code.trim().toUpperCase()}`,
      category,
      type: category === 'CAMINHAO' ? 'CAMINHAO_BASCULANTE' : 'ESCAVADEIRA',
      current_hourmeter: parseFloat(currentHourmeter) || 0,
      tipo_propriedade: 'PROPRIO'
    });

    if (res.success && res.data) {
      const formatado = `${res.data.name} (${res.data.code})`;
      onCreated(formatado);
      setName('');
      setCode('');
      setModel('');
      setCurrentHourmeter('0');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Máquina / Equipamento">
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-left">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px]">
            {error}
          </div>
        )}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Nome do Equipamento *</label>
          <input
            required
            placeholder="Ex: Escavadeira Hidráulica CAT 320"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Código / Prefixo *</label>
            <input
              required
              placeholder="Ex: ESC-05"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Modelo / Versão</label>
            <input
              placeholder="Ex: 320 GC"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="HEAVY_MACHINERY">Máquinas Pesadas</option>
              <option value="CAMINHAO">Caminhões</option>
              <option value="EQUIPAMENTO_APOIO">Equipamento de Apoio</option>
              <option value="VEICULO_LEVE">Veículo Leve / Utilitário</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {getMeasurementLabel({ category, name, code }, 'inicial')}
            </label>
            <input
              type="number"
              step={isVehicleOrTruck({ category, name, code }) ? "1" : "0.1"}
              placeholder={isVehicleOrTruck({ category, name, code }) ? "0" : "0.0"}
              value={currentHourmeter}
              onChange={(e) => setCurrentHourmeter(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-900 font-mono border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !code.trim()}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer transition-colors"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Máquina'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
