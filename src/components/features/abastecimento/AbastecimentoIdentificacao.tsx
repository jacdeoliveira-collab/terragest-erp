import React from 'react';
import { Truck } from 'lucide-react';
import type { Equipment } from '../../../types/equipment.types';
import type { Funcionario } from '../../../types/rh.types';
import type { OrigemAbastecimento } from '../../../types/abastecimento.types';
import { formatMeasurementValue } from '../../../utils/equipmentMeasurement';

interface AbastecimentoIdentificacaoProps {
  maquinaId: string;
  onMaquinaSelect: (id: string) => void;
  operadorId: string;
  setOperadorId: (id: string) => void;
  origem: OrigemAbastecimento;
  setOrigem: (val: OrigemAbastecimento) => void;
  comboioId: string;
  setComboioId: (id: string) => void;
  equipments: Equipment[];
  funcionarios: Funcionario[];
  loadingEquips: boolean;
  loadingFuncs: boolean;
}

export const AbastecimentoIdentificacao: React.FC<AbastecimentoIdentificacaoProps> = ({
  maquinaId,
  onMaquinaSelect,
  operadorId,
  setOperadorId,
  origem,
  setOrigem,
  comboioId,
  setComboioId,
  equipments,
  funcionarios,
  loadingEquips,
  loadingFuncs
}) => {
  const comboios = equipments.filter(
    (e) => e.type === 'CAMINHAO_COMBOIO' || e.name.toLowerCase().includes('comboio') || e.name.toLowerCase().includes('melosa')
  );
  const opcoesComboio = comboios.length > 0 ? comboios : equipments;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Máquina a Abastecer *</label>
          <select
            required
            value={maquinaId}
            onChange={(e) => onMaquinaSelect(e.target.value)}
            disabled={loadingEquips || equipments.length === 0}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
          >
            <option value="">{equipments.length === 0 ? 'Nenhuma máquina ativa' : 'Selecione a máquina'}</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name} ({formatMeasurementValue(eq.current_hourmeter, eq)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Operador / Motorista *</label>
          <select
            required
            value={operadorId}
            onChange={(e) => setOperadorId(e.target.value)}
            disabled={loadingFuncs || funcionarios.length === 0}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
          >
            <option value="">{funcionarios.length === 0 ? 'Nenhum operador ativo' : 'Selecione o operador'}</option>
            {funcionarios.map((fn) => (
              <option key={fn.id} value={fn.id}>
                {fn.nome} ({fn.cargo.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`grid ${origem === 'COMBOIO' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Origem do Abastecimento *</label>
          <select
            value={origem}
            onChange={(e) => {
              const val = e.target.value as OrigemAbastecimento;
              setOrigem(val);
              if (val !== 'COMBOIO') setComboioId('');
            }}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
          >
            <option value="POSTO">Posto Externo</option>
            <option value="TANQUE_FIXO">Tanque Fixo (Canteiro)</option>
            <option value="COMBOIO">Caminhão Comboio (Melosa)</option>
          </select>
        </div>

        {origem === 'COMBOIO' && (
          <div>
            <label className="block font-semibold text-amber-800 mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Caminhão Comboio (Melosa) *</span>
            </label>
            <select
              required
              value={comboioId}
              onChange={(e) => setComboioId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-amber-50/50 border border-amber-300 rounded-xl"
            >
              <option value="">Selecione a Melosa / Comboio</option>
              {opcoesComboio.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} - {eq.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
