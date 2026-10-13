import React from 'react';
import { Truck } from 'lucide-react';
import type { Equipment } from '../../../../types/equipment.types';
import type { TipoCombustivel } from '../../../../types/abastecimento.types';
import { getMeasurementLabel, isVehicleOrTruck, formatMeasurementValue } from '../../../../utils/equipmentMeasurement';

interface CupomItemPrincipalCardProps {
  equipments: Equipment[];
  maquinaId: string;
  onSelectMaq: (id: string) => void;
  tipoComb: TipoCombustivel;
  setTipoComb: (val: TipoCombustivel) => void;
  horimetro: number;
  setHorimetro: (val: number) => void;
  litros: number;
  setLitros: (val: number) => void;
  valor: number;
  setValor: (val: number) => void;
}

export const CupomItemPrincipalCard: React.FC<CupomItemPrincipalCardProps> = ({
  equipments,
  maquinaId,
  onSelectMaq,
  tipoComb,
  setTipoComb,
  horimetro,
  setHorimetro,
  litros,
  setLitros,
  valor,
  setValor
}) => {
  const selectedMaq = equipments.find((e) => e.id === maquinaId);
  const isKm = isVehicleOrTruck(selectedMaq);
  const maquinas = equipments.filter((e) => e.category !== 'VEICULO_LEVE');

  return (
    <div className="p-3.5 bg-amber-50/60 border border-amber-200/90 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
          <Truck className="w-4 h-4 text-amber-600" />
          <span>Equipamento Principal / Caminhão</span>
        </div>
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
          Obrigatório
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-8">
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Máquina / Caminhão *
          </label>
          <select
            required
            value={maquinaId}
            onChange={(e) => onSelectMaq(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Selecione o equipamento...</option>
            {maquinas.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name} ({formatMeasurementValue(eq.current_hourmeter, eq)})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Tipo de Combustível *
          </label>
          <select
            value={tipoComb}
            onChange={(e) => setTipoComb(e.target.value as TipoCombustivel)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
          >
            <option value="DIESEL_S500">Diesel S500 (Comum)</option>
            <option value="DIESEL_S10">Diesel S10</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            {getMeasurementLabel(selectedMaq)}
          </label>
          <input
            type="number"
            step={isKm ? '1' : '0.1'}
            value={horimetro || ''}
            onChange={(e) => setHorimetro(parseFloat(e.target.value) || 0)}
            placeholder={isKm ? 'Ex: 158420' : 'Ex: 4189.0'}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Volume em Litros (L) *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={litros || ''}
            onChange={(e) => setLitros(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-amber-950 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Valor Total do Item (R$) *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={valor || ''}
            onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-amber-950 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
