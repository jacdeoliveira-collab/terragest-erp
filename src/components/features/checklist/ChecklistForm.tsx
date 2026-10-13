import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useCreateChecklist } from '../../../hooks/useCreateChecklist';
import { ChecklistItensInspecao } from './ChecklistItensInspecao';
import { PinPadModal } from '../../ui/PinPadModal';
import { isVehicleOrTruck, getMeasurementLabel } from '../../../utils/equipmentMeasurement';

interface ChecklistFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChecklistForm: React.FC<ChecklistFormProps> = ({ onSuccess, onCancel }) => {
  const { data: equipments, isLoading: loadingEquips } = useEquipments();
  const { data: funcionarios, isLoading: loadingFuncs } = useFuncionarios();
  const { createChecklist, isSubmitting, error, limparErro } = useCreateChecklist();
  const [maquinaId, setMaquinaId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [horimetroAtual, setHorimetroAtual] = useState<number | ''>('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [nivelOleoOk, setNivelOleoOk] = useState(true);
  const [vazamentosOk, setVazamentosOk] = useState(true);
  const [statusGeralAprovado, setStatusGeralAprovado] = useState(true);
  const [observacoes, setObservacoes] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const selectedFunc = funcionarios.find(f => f.id === operadorId);
  const selectedEquip = equipments.find(e => e.id === maquinaId);
  const isVeic = isVehicleOrTruck(selectedEquip);

  const handleMaquinaChange = (id: string) => {
    setMaquinaId(id);
    const equip = equipments.find(e => e.id === id);
    if (equip?.current_hourmeter) setHorimetroAtual(equip.current_hourmeter);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    if (operadorId) setShowPinModal(true);
    else handleSalvarChecklist(false);
  };

  const handleSalvarChecklist = async (assinadoPorPin: boolean) => {
    setShowPinModal(false);
    const result = await createChecklist({
      maquina_id: maquinaId,
      operador_id: operadorId || undefined,
      data,
      horimetro_atual: typeof horimetroAtual === 'number' ? horimetroAtual : undefined,
      nivel_oleo_ok: nivelOleoOk,
      vazamentos_ok: vazamentosOk,
      status_geral_aprovado: statusGeralAprovado,
      observacoes,
      assinado_por_pin: assinadoPorPin
    });
    if (result.success) onSuccess();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Máquina / Linha Amarela *</label>
          <select
            required
            value={maquinaId}
            onChange={(e) => handleMaquinaChange(e.target.value)}
            disabled={loadingEquips || equipments.length === 0}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{equipments.length === 0 ? 'Nenhuma máquina' : 'Selecione a máquina'}</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.code} - {eq.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Operador Responsável</label>
          <select
            value={operadorId}
            onChange={(e) => setOperadorId(e.target.value)}
            disabled={loadingFuncs || funcionarios.length === 0}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{funcionarios.length === 0 ? 'Nenhum operador' : 'Selecione o operador'}</option>
            {funcionarios.map((fn) => (
              <option key={fn.id} value={fn.id}>{fn.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Data da Inspeção *</label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {getMeasurementLabel(selectedEquip, 'inicial')} *
          </label>
          <input
            type="number" step={isVeic ? '1' : '0.1'} placeholder={isVeic ? 'Ex: 158420' : 'Ex: 1250.5'} value={horimetroAtual}
            onChange={(e) => setHorimetroAtual(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono"
          />
        </div>
      </div>

      <ChecklistItensInspecao
        nivelOleoOk={nivelOleoOk} setNivelOleoOk={setNivelOleoOk}
        vazamentosOk={vazamentosOk} setVazamentosOk={setVazamentosOk}
        observacoes={observacoes} setObservacoes={setObservacoes}
        statusGeralAprovado={statusGeralAprovado} setStatusGeralAprovado={setStatusGeralAprovado}
      />

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer">Cancelar</button>
        <button type="submit" disabled={isSubmitting || equipments.length === 0} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
          {isSubmitting ? 'Salvando...' : 'Assinar com PIN & Salvar'}
        </button>
      </div>
    </form>
    <PinPadModal
      isOpen={showPinModal} onClose={() => setShowPinModal(false)}
      onSuccess={() => handleSalvarChecklist(true)} operadorNome={selectedFunc?.nome || 'Operador'}
      expectedPin={selectedFunc?.pin_assinatura} tituloAcao="Assinatura Eletrônica do Checklist"
    />
  </>
  );
};
