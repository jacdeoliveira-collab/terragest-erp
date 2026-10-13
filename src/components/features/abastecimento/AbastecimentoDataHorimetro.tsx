import React from 'react';
import type { MeasurableEquipment } from '../../../utils/equipmentMeasurement';
import { isVehicleOrTruck, getMeasurementLabel } from '../../../utils/equipmentMeasurement';

interface AbastecimentoDataHorimetroProps {
  data: string;
  setData: (val: string) => void;
  horimetro: number;
  setHorimetro: (val: number) => void;
  selectedEquip?: MeasurableEquipment | null;
}

export const AbastecimentoDataHorimetro: React.FC<AbastecimentoDataHorimetroProps> = ({
  data,
  setData,
  horimetro,
  setHorimetro,
  selectedEquip
}) => {
  const isKm = isVehicleOrTruck(selectedEquip);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Data / Hora *</label>
        <input
          type="datetime-local"
          required
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
        />
      </div>
      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          {getMeasurementLabel(selectedEquip)} no Abastecimento *
        </label>
        <input
          type="number"
          step={isKm ? "1" : "0.1"}
          required
          value={horimetro || ''}
          onChange={(e) => setHorimetro(parseFloat(e.target.value) || 0)}
          placeholder={isKm ? "Ex: 158420" : "Ex: 4189.0"}
          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono"
        />
      </div>
    </div>
  );
};
