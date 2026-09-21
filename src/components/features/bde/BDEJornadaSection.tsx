import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import type { MotivoOciosidade } from '../../../types/bde.types';

interface BDEJornadaSectionProps {
  horaInicio: string;
  horaFim: string;
  onChangeInicio: (val: string) => void;
  onChangeFim: (val: string) => void;
  horasJornada: number;
  horasMaquina: number;
  motivoParada: string;
  onChangeMotivo: (val: MotivoOciosidade) => void;
}

export const BDEJornadaSection: React.FC<BDEJornadaSectionProps> = ({
  horaInicio,
  horaFim,
  onChangeInicio,
  onChangeFim,
  horasJornada,
  horasMaquina,
  motivoParada,
  onChangeMotivo
}) => {
  const ociosidade = Math.max(0, horasJornada - horasMaquina);
  const temOciosidadeSignificativa = ociosidade > 0.5;

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          Jornada de Trabalho (Homem x Máquina)
        </span>
        <span className="text-[11px] font-mono text-gray-500">
          Jornada: <b className="text-gray-900">{horasJornada.toFixed(1)}h</b> | Máquina: <b className="text-gray-900">{horasMaquina.toFixed(1)}h</b>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Entrada do Operador *</label>
          <input
            type="time"
            required
            value={horaInicio}
            onChange={(e) => onChangeInicio(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Saída do Operador *</label>
          <input
            type="time"
            required
            value={horaFim}
            onChange={(e) => onChangeFim(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono"
          />
        </div>
      </div>

      {temOciosidadeSignificativa && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Ociosidade Detectada: {ociosidade.toFixed(1)}h sem produção de horímetro</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-amber-900 mb-1">
              Motivo da Ociosidade / Parada *
            </label>
            <select
              required
              value={motivoParada}
              onChange={(e) => onChangeMotivo(e.target.value as MotivoOciosidade)}
              className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="">Selecione obrigatoriamente o motivo...</option>
              <option value="Chuva">Chuva / Clima Impraticável</option>
              <option value="Manutenção Corretiva">Manutenção Corretiva / Quebra</option>
              <option value="Aguardando Frente de Serviço">Aguardando Frente de Serviço / Topografia</option>
              <option value="Falta de Combustível">Falta de Combustível / Comboio</option>
              <option value="Outros">Outros Motivos Operacionais</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
