import React from 'react';
import { Car, Trash2 } from 'lucide-react';
import type { Equipment } from '../../../../types/equipment.types';
import type { TipoCombustivel } from '../../../../types/abastecimento.types';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';

interface CupomItemApoioCardProps {
  equipments: Equipment[];
  veiculoApoioId: string;
  onSelectApoio: (id: string) => void;
  tipoComb: TipoCombustivel;
  setTipoComb: (val: TipoCombustivel) => void;
  km: number;
  setKm: (val: number) => void;
  litros: number;
  setLitros: (val: number) => void;
  valor: number;
  setValor: (val: number) => void;
  onRemover: () => void;
}

export const CupomItemApoioCard: React.FC<CupomItemApoioCardProps> = ({
  equipments,
  veiculoApoioId,
  onSelectApoio,
  tipoComb,
  setTipoComb,
  km,
  setKm,
  litros,
  setLitros,
  valor,
  setValor,
  onRemover
}) => {
  const veiculosLeves = equipments.filter((e) => isVehicleOrTruck(e));

  return (
    <div className="p-3.5 bg-blue-50/60 border border-blue-200/90 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
          <Car className="w-4 h-4 text-blue-600" />
          <span>Veículo de Apoio / Caminhonete (Mesmo Cupom)</span>
        </div>
        <button
          type="button"
          onClick={onRemover}
          className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold cursor-pointer px-2 py-0.5 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remover Veículo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-8">
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Caminhonete / Veículo Leve *
          </label>
          <select
            required
            value={veiculoApoioId}
            onChange={(e) => onSelectApoio(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione o veículo de apoio...</option>
            {veiculosLeves.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name}
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
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
          >
            <option value="DIESEL_S10">Diesel S10</option>
            <option value="GASOLINA">Gasolina Comum</option>
            <option value="ETANOL">Etanol</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            KM Atual (Odômetro)
          </label>
          <input
            type="number"
            step="1"
            value={km || ''}
            onChange={(e) => setKm(parseFloat(e.target.value) || 0)}
            placeholder="Ex: 85200"
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
