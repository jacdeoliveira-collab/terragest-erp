import React from 'react';
import { Fuel, Calendar, Gauge, DollarSign, Building } from 'lucide-react';
import type { Equipment } from '../../../../types/equipment.types';
import type { TipoCombustivel } from '../../../../types/abastecimento.types';
import { getMeasurementLabel, isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';

interface Props {
  equipments: Equipment[];
  maquinaId: string;
  setMaquinaId: (v: string) => void;
  data: string;
  setData: (v: string) => void;
  tipoCombustivel: TipoCombustivel;
  setTipoCombustivel: (v: TipoCombustivel) => void;
  horimetro: number;
  setHorimetro: (v: number) => void;
  litros: number;
  setLitros: (v: number) => void;
  valorTotal: number;
  setValorTotal: (v: number) => void;
  postoFornecedor: string;
  setPostoFornecedor: (v: string) => void;
}

export const AbastecimentoEditFields: React.FC<Props> = ({
  equipments,
  maquinaId, setMaquinaId,
  data, setData,
  tipoCombustivel, setTipoCombustivel,
  horimetro, setHorimetro,
  litros, setLitros,
  valorTotal, setValorTotal,
  postoFornecedor, setPostoFornecedor
}) => {
  const selectedEq = equipments.find((e) => e.id === maquinaId);
  const isKm = isVehicleOrTruck(selectedEq);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Máquina / Veículo</label>
          <select
            value={maquinaId}
            onChange={(e) => setMaquinaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
            required
          >
            <option value="">Selecione...</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.code} - {eq.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-500" /> Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-amber-600" /> Combustível
          </label>
          <select
            value={tipoCombustivel}
            onChange={(e) => setTipoCombustivel(e.target.value as TipoCombustivel)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-xl bg-white text-[11px]"
          >
            <option value="DIESEL_S10">Diesel S10</option>
            <option value="DIESEL_S500">Diesel S500</option>
            <option value="GASOLINA">Gasolina</option>
            <option value="ETANOL">Etanol</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-blue-600" /> {getMeasurementLabel(selectedEq)}
          </label>
          <input
            type="number"
            step={isKm ? "1" : "0.1"}
            value={horimetro || ''}
            onChange={(e) => setHorimetro(parseFloat(e.target.value) || 0)}
            placeholder={isKm ? "Ex: 158420" : "Ex: 4189.0"}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-xl font-mono"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Litros (L)</label>
          <input
            type="number"
            step="0.01"
            value={litros || ''}
            onChange={(e) => setLitros(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-xl font-mono font-bold"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Valor Total (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={valorTotal || ''}
            onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-xl font-mono font-bold text-emerald-700"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
          <Building className="w-3.5 h-3.5 text-gray-500" /> Posto / Fornecedor
        </label>
        <input
          type="text"
          value={postoFornecedor}
          onChange={(e) => setPostoFornecedor(e.target.value)}
          placeholder="Ex: Posto São Paulo, Tanque Central..."
          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
        />
      </div>
    </>
  );
};
