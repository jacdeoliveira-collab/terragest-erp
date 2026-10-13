import React from 'react';
import type { Equipment } from '../../../types/equipment.types';
import type { Funcionario } from '../../../types/rh.types';
import { formatMeasurementValue } from '../../../utils/equipmentMeasurement';

interface BDEIdentificacaoProps {
  equipmentId: string;
  setEquipmentId: (val: string) => void;
  operadorId: string;
  setOperadorId: (val: string) => void;
  equipments: Equipment[];
  funcionarios: Funcionario[];
  loadingEquips: boolean;
  loadingFuncs: boolean;
  onEquipmentSelect: (id: string) => void;
}

export const BDEIdentificacao: React.FC<BDEIdentificacaoProps> = ({
  equipmentId,
  operadorId,
  setOperadorId,
  equipments,
  funcionarios,
  loadingEquips,
  loadingFuncs,
  onEquipmentSelect
}) => {
  const equipamentosAtivos = equipments.filter(
    (eq) => eq.status === 'AVAILABLE' || (eq.status as string) === 'ATIVO'
  );
  const operadoresAtivos = funcionarios.filter((fn) => fn.status === 'ATIVO');

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Máquina (Ativa) *</label>
        <select
          required
          value={equipmentId}
          onChange={(e) => onEquipmentSelect(e.target.value)}
          disabled={loadingEquips || equipamentosAtivos.length === 0}
          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
        >
          <option value="">{equipamentosAtivos.length === 0 ? 'Nenhuma máquina ativa' : 'Selecione'}</option>
          {equipamentosAtivos.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.code} - {eq.name} ({formatMeasurementValue(eq.current_hourmeter, eq)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Operador (Ativo) *</label>
        <select
          required
          value={operadorId}
          onChange={(e) => setOperadorId(e.target.value)}
          disabled={loadingFuncs || operadoresAtivos.length === 0}
          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
        >
          <option value="">{operadoresAtivos.length === 0 ? 'Nenhum operador ativo' : 'Selecione o operador'}</option>
          {operadoresAtivos.map((fn) => (
            <option key={fn.id} value={fn.id}>
              {fn.nome} ({fn.cargo.replace('_', ' ')})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
