import React from 'react';
import type { TipoManutencao } from '../../../types/manutencao.types';
import { isVehicleOrTruck, getMeasurementLabel, formatMeasurementValue } from '../../../utils/equipmentMeasurement';

export interface ManutencaoDadosTabProps {
  maquinaId: string;
  setMaquinaId: (val: string) => void;
  tipoManutencao: TipoManutencao;
  setTipoManutencao: (val: TipoManutencao) => void;
  dataServico: string;
  setDataServico: (val: string) => void;
  descricaoServico: string;
  setDescricaoServico: (val: string) => void;
  ultimoHorimetro: number;
  setUltimoHorimetro: (val: number) => void;
  intervaloHoras: number;
  setIntervaloHoras: (val: number) => void;
  mecanico: string;
  setMecanico: (val: string) => void;
  equipments: { id: string; code: string; name: string; current_hourmeter: number; category?: string; type?: string }[];
  loadingEquips: boolean;
  onMaquinaSelect: (id: string) => void;
}

export const ManutencaoDadosTab: React.FC<ManutencaoDadosTabProps> = ({
  maquinaId, tipoManutencao, setTipoManutencao, dataServico, setDataServico,
  descricaoServico, setDescricaoServico, ultimoHorimetro, setUltimoHorimetro,
  intervaloHoras, setIntervaloHoras, mecanico, setMecanico, equipments,
  loadingEquips, onMaquinaSelect
}) => {
  const selectedEquip = equipments.find((e) => e.id === maquinaId);
  const isKm = isVehicleOrTruck(selectedEquip);

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Máquina / Veículo *</label>
        <select
          required value={maquinaId} onChange={(e) => onMaquinaSelect(e.target.value)}
          disabled={loadingEquips || equipments.length === 0}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">{equipments.length === 0 ? 'Nenhum equipamento disponível' : 'Selecione o equipamento'}</option>
          {equipments.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.code} - {eq.name} ({formatMeasurementValue(eq.current_hourmeter, eq)})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Manutenção *</label>
          <select
            value={tipoManutencao} onChange={(e) => setTipoManutencao(e.target.value as TipoManutencao)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="PREVENTIVA">Preventiva (Revisão Periódica / Óleo)</option>
            <option value="CORRETIVA">Corretiva (Quebra / Reparo de Emergência)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Data do Serviço *</label>
          <input
            type="date" required value={dataServico} onChange={(e) => setDataServico(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{getMeasurementLabel(selectedEquip, 'atual')} *</label>
          <input
            type="number" step={isKm ? "1" : "0.1"} required value={ultimoHorimetro}
            onChange={(e) => setUltimoHorimetro(parseFloat(e.target.value) || 0)}
            placeholder={isKm ? "Ex: 158420" : "Ex: 4189.0"}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Intervalo Próxima Revisão ({isKm ? 'KM' : 'Horas'})</label>
          <select
            value={intervaloHoras} onChange={(e) => setIntervaloHoras(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            {isKm ? (
              <>
                <option value={5000}>5.000 km (Uso Severo / Óleo)</option>
                <option value={10000}>10.000 km (Revisão Padrão)</option>
                <option value={20000}>20.000 km (Intermediária)</option>
                <option value={40000}>40.000 km (Geral / Freios)</option>
              </>
            ) : (
              <>
                <option value={250}>250 horas (Óleo & Filtros)</option>
                <option value={500}>500 horas (Intermediária)</option>
                <option value={1000}>1000 horas (Sistema Hidráulico)</option>
                <option value={2000}>2000 horas (Geral / Trem de Força)</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição do Serviço Realizado *</label>
        <textarea
          rows={2} required value={descricaoServico} onChange={(e) => setDescricaoServico(e.target.value)}
          placeholder="Ex: Troca de filtros de combustível primário/secundário e substituição de mangueira..."
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Mecânico / Oficina Responsável</label>
        <input
          type="text" placeholder="Ex: Oficina Mecânica Central / Mecânico Silva"
          value={mecanico} onChange={(e) => setMecanico(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
