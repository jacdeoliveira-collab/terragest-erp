import React from 'react';
import { Package, Hash } from 'lucide-react';
import type { UnidadeMedidaMaterial } from '../../../types/almoxarifado.types';

interface MovimentacaoMaterialTabProps {
  materialNome: string;
  setMaterialNome: (val: string) => void;
  unidadeMedida: UnidadeMedidaMaterial;
  setUnidadeMedida: (val: UnidadeMedidaMaterial) => void;
  quantidade: number;
  setQuantidade: (val: number) => void;
}

const MATERIAIS_SUGERIDOS = [
  'Cimento Portland CP-II / CP-IV',
  'Brita 0 (Pedrisco)',
  'Brita 1 (Para Concreto)',
  'Brita 2',
  'Brita Graduada (BGS)',
  'Rachão de Pedra',
  'Areia Média Lavada',
  'CBUQ (Massa Asfáltica)',
  'Emulsão Asfáltica (RR-2C / RL-1C)',
  'Aço CA-50 / CA-60',
  'Tubos de Concreto Drenagem (PA-1/PA-2)',
  'Manta Geotêxtil (Bidim)'
];

export const MovimentacaoMaterialTab: React.FC<MovimentacaoMaterialTabProps> = ({
  materialNome,
  setMaterialNome,
  unidadeMedida,
  setUnidadeMedida,
  quantidade,
  setQuantidade
}) => {
  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-600" />
          <span>Material / Insumo Pesado *</span>
        </label>
        <input
          required
          list="lista-materiais-almoxarifado"
          placeholder="Ex: Cimento Portland CP-IV ou Brita 1"
          value={materialNome}
          onChange={(e) => setMaterialNome(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
        <datalist id="lista-materiais-almoxarifado">
          {MATERIAIS_SUGERIDOS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Unidade de Medida *</label>
          <select
            value={unidadeMedida}
            onChange={(e) => setUnidadeMedida(e.target.value as UnidadeMedidaMaterial)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TON">Toneladas (TON / t)</option>
            <option value="M3">Metros Cúbicos (m³)</option>
            <option value="SACO">Sacos (50kg)</option>
            <option value="KG">Quilogramas (kg)</option>
            <option value="LITRO">Litros (L)</option>
            <option value="UN">Unidades (Peças / Barras)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-amber-600" />
            <span>Quantidade Movimentada *</span>
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            required
            placeholder="0.000"
            value={quantidade || ''}
            onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
