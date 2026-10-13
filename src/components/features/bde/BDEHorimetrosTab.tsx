import React from 'react';
import { Gauge, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import type { MotivoOciosidade } from '../../../types/bde.types';
import type { MeasurableEquipment } from '../../../utils/equipmentMeasurement';
import { isVehicleOrTruck, getMeasurementLabel } from '../../../utils/equipmentMeasurement';

interface BDEHorimetrosTabProps {
  initialHourmeter: number;
  setInitialHourmeter: (val: number) => void;
  finalHourmeter: number;
  setFinalHourmeter: (val: number) => void;
  horasProdutivas: number;
  setHorasProdutivas: (val: number) => void;
  horasOciosas: number;
  setHorasOciosas: (val: number) => void;
  motivoParada: string;
  setMotivoParada: (val: MotivoOciosidade | '') => void;
  selectedEquip?: MeasurableEquipment | null;
}

export const BDEHorimetrosTab: React.FC<BDEHorimetrosTabProps> = ({
  initialHourmeter, setInitialHourmeter,
  finalHourmeter, setFinalHourmeter,
  horasProdutivas, setHorasProdutivas,
  horasOciosas, setHorasOciosas,
  motivoParada, setMotivoParada,
  selectedEquip
}) => {
  const isKm = isVehicleOrTruck(selectedEquip);
  const delta = Math.max(0, Number((finalHourmeter - initialHourmeter).toFixed(1)));
  const isInvalido = finalHourmeter < initialHourmeter;
  const step = isKm ? "1" : "0.1";
  const diffStr = isKm ? `${Math.round(delta).toLocaleString('pt-BR')} km` : `${delta.toFixed(1)} h`;

  const handleFinalChange = (newFinal: number) => {
    setFinalHourmeter(newFinal);
    const d = Math.max(0, Number((newFinal - initialHourmeter).toFixed(1)));
    if (horasProdutivas === 0 || horasProdutivas === delta) {
      setHorasProdutivas(d);
    }
  };

  return (
    <div className="space-y-3.5 text-xs text-left">
      {isInvalido && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{isKm ? 'A quilometragem final não pode ser menor que a inicial.' : 'O horímetro final não pode ser menor que o horímetro inicial.'}</span>
        </div>
      )}

      {/* Leitura de Odômetro / Horímetro */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
        <span className="font-semibold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            {isKm ? 'Leitura do Odômetro / Quilometragem' : 'Leitura dos Horímetros da Máquina'}
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            Diferença: <b className="text-emerald-700">{diffStr}</b>
          </span>
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              {getMeasurementLabel(selectedEquip, 'inicial')} *
            </label>
            <input
              type="number"
              step={step}
              required
              value={initialHourmeter}
              onChange={(e) => setInitialHourmeter(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              {getMeasurementLabel(selectedEquip, 'final')} *
            </label>
            <input
              type="number"
              step={step}
              required
              value={finalHourmeter}
              onChange={(e) => handleFinalChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Apropriação de Horas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Horas Produtivas (h) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            required
            value={horasProdutivas}
            onChange={(e) => setHorasProdutivas(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-emerald-800 font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Horas Ociosas / Parada (h)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={horasOciosas}
            onChange={(e) => setHorasOciosas(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-amber-800 font-bold"
          />
        </div>
      </div>

      {/* Motivo de Parada */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          Motivo de Parada / Ociosidade {horasOciosas > 0 ? '*' : '(Opcional)'}
        </label>
        <select
          value={motivoParada}
          required={horasOciosas > 0}
          onChange={(e) => setMotivoParada(e.target.value as MotivoOciosidade | '')}
          className={`w-full px-2.5 py-2 bg-gray-50 border rounded-xl font-medium text-gray-900 ${
            horasOciosas > 0 && !motivoParada ? 'border-amber-400 bg-amber-50/50' : 'border-gray-300'
          }`}
        >
          <option value="">Selecione o motivo da ociosidade...</option>
          <option value="Chuva">Chuva / Condições Climáticas</option>
          <option value="Manutenção Corretiva">Manutenção Corretiva / Quebra Mecânica</option>
          <option value="Aguardando Frente de Serviço">Aguardando Frente de Serviço / Topografia</option>
          <option value="Falta de Combustível">Falta de Combustível / Abastecimento</option>
          <option value="Outros">Outros Motivos Operacionais</option>
        </select>
      </div>
    </div>
  );
};
