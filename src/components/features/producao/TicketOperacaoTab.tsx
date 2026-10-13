import React from 'react';
import { Layers, MapPin, Gauge } from 'lucide-react';
import type { TipoMaterialProducao } from '../../../types/producao.types';

interface TicketOperacaoTabProps {
  materialTipo: TipoMaterialProducao;
  setMaterialTipo: (val: TipoMaterialProducao) => void;
  volumeM3: number;
  setVolumeM3: (val: number) => void;
  origemEstaca: string;
  setOrigemEstaca: (val: string) => void;
  destinoEstaca: string;
  setDestinoEstaca: (val: string) => void;
  dmtKm: number;
  setDmtKm: (val: number) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
}

export const TicketOperacaoTab: React.FC<TicketOperacaoTabProps> = ({
  materialTipo,
  setMaterialTipo,
  volumeM3,
  setVolumeM3,
  origemEstaca,
  setOrigemEstaca,
  destinoEstaca,
  setDestinoEstaca,
  dmtKm,
  setDmtKm,
  observacoes,
  setObservacoes
}) => {
  const atalhosVolume = [10, 12, 14, 16, 18];

  return (
    <div className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Tipo de Material Transportado *</span>
          </label>
          <select
            value={materialTipo}
            onChange={(e) => setMaterialTipo(e.target.value as TipoMaterialProducao)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="SOLO_COMUM">Solo Comum (Terra / Argila)</option>
            <option value="ROCHA">Rocha (Desmonte / Rachão)</option>
            <option value="BOTA_FORA">Bota-Fora (Material Inservível)</option>
            <option value="ATERRO">Material de Aterro Selecionado</option>
            <option value="SAIBRO">Saibro / Piçarra</option>
            <option value="AREIA">Areia Lavada / Média</option>
            <option value="BRITA">Brita Graduada / Rachão</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-600" />
              Volume da Caçamba (m³) *
            </span>
          </label>
          <div className="space-y-1.5">
            <input
              type="number"
              step="0.5"
              min="1"
              required
              value={volumeM3}
              onChange={(e) => setVolumeM3(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-1.5">
              {atalhosVolume.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setVolumeM3(vol)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    volumeM3 === vol ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {vol}m³
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Origem (Corte / Jazida)</span>
          </label>
          <input
            placeholder="Ex: Estaca 120 / Jazida Alfa"
            value={origemEstaca}
            onChange={(e) => setOrigemEstaca(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-600" />
            <span>Destino (Aterro / Bota-fora)</span>
          </label>
          <input
            placeholder="Ex: Estaca 155 / Bota-Fora 02"
            value={destinoEstaca}
            onChange={(e) => setDestinoEstaca(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">DMT (Distância em km)</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            placeholder="Ex: 2.5"
            value={dmtKm}
            onChange={(e) => setDmtKm(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Observações do Sinaleiro</label>
        <input
          placeholder="Ex: Carga coroada, material úmido após chuva."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
