import React, { useState, useMemo } from 'react';
import { AlertCircle, HardHat } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useCreateBDE } from '../../../hooks/useCreateBDE';
import { useObraContext } from '../../../contexts/ObraContext';
import { BDEIdentificacao } from './BDEIdentificacao';
import { BDEJornadaSection } from './BDEJornadaSection';
import type { MotivoOciosidade } from '../../../types/bde.types';

interface BDEFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BDEForm: React.FC<BDEFormProps> = ({ onSuccess, onCancel }) => {
  const { obraSelecionada } = useObraContext();
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { data: funcionarios, isLoading: loadingFuncs } = useFuncionarios({ onlyActives: true });
  const { createBDE, isSubmitting, error, limparErro } = useCreateBDE();

  const [equipmentId, setEquipmentId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [initialHourmeter, setInitialHourmeter] = useState<number>(0);
  const [finalHourmeter, setFinalHourmeter] = useState<number>(0);
  const [horaInicio, setHoraInicio] = useState('07:00');
  const [horaFim, setHoraFim] = useState('17:00');
  const [motivoParada, setMotivoParada] = useState<MotivoOciosidade | ''>('');
  const [description, setDescription] = useState('');

  if (!obraSelecionada) {
    return (
      <div className="p-8 text-center bg-amber-50/70 border border-amber-200 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto mb-3">
          <HardHat className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-amber-900 mb-1">Centro de Custo Não Selecionado</h4>
        <p className="text-xs text-amber-800 max-w-sm mx-auto mb-4">
          ⚠️ Selecione uma obra ativa no cabeçalho do sistema para realizar apontamentos.
        </p>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl">
          Fechar
        </button>
      </div>
    );
  }

  const horasJornada = useMemo(() => {
    if (!horaInicio || !horaFim) return 0;
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFim.split(':').map(Number);
    return Math.max(0, Number((((h2 * 60 + m2) - (h1 * 60 + m1)) / 60).toFixed(1)));
  }, [horaInicio, horaFim]);

  const horasMaquina = Math.max(0, finalHourmeter - initialHourmeter);

  const handleEquipmentSelect = (id: string) => {
    setEquipmentId(id);
    const equip = equipments.find((e) => e.id === id);
    if (equip) {
      setInitialHourmeter(equip.current_hourmeter);
      setFinalHourmeter(equip.current_hourmeter);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    if (finalHourmeter < initialHourmeter) {
      alert('O horímetro final não pode ser menor que o inicial.');
      return;
    }
    if (horasJornada - horasMaquina > 0.5 && !motivoParada) {
      alert('Por favor, selecione o motivo da ociosidade detectada.');
      return;
    }

    const selectedEquip = equipments.find((e) => e.id === equipmentId);
    const selectedFunc = funcionarios.find((f) => f.id === operadorId);

    const result = await createBDE({
      obra_id: obraSelecionada.id,
      equipment_id: equipmentId,
      operador_id: operadorId,
      date,
      hora_inicio_jornada: horaInicio,
      hora_fim_jornada: horaFim,
      total_hours: horasJornada,
      motivo_parada: motivoParada || undefined,
      operator_name: selectedFunc?.nome || 'Operador',
      client_name: obraSelecionada.nome,
      work_location: selectedEquip?.name || obraSelecionada.localizacao || 'Canteiro',
      initial_hourmeter: initialHourmeter,
      final_hourmeter: finalHourmeter,
      fuel_liters: 0,
      service_description: description,
      status: 'SUBMITTED'
    });

    if (result.success) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left text-xs">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <BDEIdentificacao
        equipmentId={equipmentId} setEquipmentId={setEquipmentId}
        operadorId={operadorId} setOperadorId={setOperadorId}
        equipments={equipments} funcionarios={funcionarios}
        loadingEquips={loadingEquips} loadingFuncs={loadingFuncs}
        onEquipmentSelect={handleEquipmentSelect}
      />

      <BDEJornadaSection
        horaInicio={horaInicio} horaFim={horaFim}
        onChangeInicio={setHoraInicio} onChangeFim={setHoraFim}
        horasJornada={horasJornada} horasMaquina={horasMaquina}
        motivoParada={motivoParada} onChangeMotivo={setMotivoParada}
      />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Data *</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">H. Inicial *</label>
          <input type="number" step="0.1" required value={initialHourmeter} onChange={(e) => setInitialHourmeter(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">H. Final *</label>
          <input type="number" step="0.1" required value={finalHourmeter} onChange={(e) => setFinalHourmeter(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Descrição do Serviço *</label>
        <textarea required rows={2} placeholder="Ex: Aterro e nivelamento de subleito" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || equipments.length === 0} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          {isSubmitting ? 'Salvando...' : 'Lançar Boletim'}
        </button>
      </div>
    </form>
  );
};
