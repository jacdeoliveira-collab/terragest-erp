import React from 'react';
import { Truck, User, HardHat, Calendar } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useObras } from '../../../hooks/useObras';
import { formatMeasurementValue } from '../../../utils/equipmentMeasurement';

interface BDEDadosIniciaisTabProps {
  equipmentId: string;
  setEquipmentId: (val: string) => void;
  operadorId: string;
  setOperadorId: (val: string) => void;
  obraId: string;
  setObraId: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  onEquipmentSelect: (id: string) => void;
}

export const BDEDadosIniciaisTab: React.FC<BDEDadosIniciaisTabProps> = ({
  equipmentId,
  operadorId,
  setOperadorId,
  obraId,
  setObraId,
  date,
  setDate,
  onEquipmentSelect
}) => {
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { data: funcionarios, isLoading: loadingFuncs } = useFuncionarios({ onlyActives: true });
  const { obras, loading: loadingObras } = useObras();

  const equipamentosAtivos = equipments.filter(
    (eq) => eq.status === 'AVAILABLE' || (eq.status as string) === 'ATIVO'
  );
  const operadoresAtivos = funcionarios.filter((fn) => fn.status === 'ATIVO');
  
  // Filtra obras que estão 'EM_ANDAMENTO' (ou ATIVA como fallback para canteiros ativos)
  const obrasEmAndamento = obras.filter(
    (o) => o.status === 'EM_ANDAMENTO' || o.status === 'ATIVA'
  );
  const obrasExibidas = obrasEmAndamento.length > 0 ? obrasEmAndamento : obras;

  return (
    <div className="space-y-3.5 text-xs text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <HardHat className="w-3.5 h-3.5 text-amber-600" />
            Obra / Centro de Custo (Em Andamento) *
          </label>
          <select
            required
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            disabled={loadingObras}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
          >
            <option value="">{loadingObras ? 'Carregando obras...' : 'Selecione a obra...'}</option>
            {obrasExibidas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome} ({o.status === 'EM_ANDAMENTO' ? 'Em Andamento' : o.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Data do Boletim *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            Equipamento / Máquina *
          </label>
          <select
            required
            value={equipmentId}
            onChange={(e) => onEquipmentSelect(e.target.value)}
            disabled={loadingEquips || equipamentosAtivos.length === 0}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
          >
            <option value="">{equipamentosAtivos.length === 0 ? 'Nenhuma máquina disponível' : 'Selecione a máquina'}</option>
            {equipamentosAtivos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name} ({formatMeasurementValue(eq.current_hourmeter, eq)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            Operador Responsável *
          </label>
          <select
            required
            value={operadorId}
            onChange={(e) => setOperadorId(e.target.value)}
            disabled={loadingFuncs || operadoresAtivos.length === 0}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
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
    </div>
  );
};
