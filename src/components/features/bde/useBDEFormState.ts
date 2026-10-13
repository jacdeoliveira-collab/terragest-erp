import { useState } from 'react';
import { useObraContext } from '../../../contexts/ObraContext';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useCreateBDE } from '../../../hooks/useCreateBDE';
import type { MotivoOciosidade } from '../../../types/bde.types';

export function useBDEFormState(onSuccess: () => void) {
  const { obraSelecionada } = useObraContext();
  const { data: equipments } = useEquipments({ onlyActives: true });
  const { data: funcionarios } = useFuncionarios({ onlyActives: true });
  const { createBDE, isSubmitting, error, limparErro } = useCreateBDE();

  const [activeTab, setActiveTab] = useState<'dados' | 'horimetros' | 'localizacao'>('dados');
  const [obraId, setObraId] = useState(obraSelecionada?.id || '');
  const [equipmentId, setEquipmentId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [initialHourmeter, setInitialHourmeter] = useState<number>(0);
  const [finalHourmeter, setFinalHourmeter] = useState<number>(0);
  const [horasProdutivas, setHorasProdutivas] = useState<number>(0);
  const [horasOciosas, setHorasOciosas] = useState<number>(0);
  const [motivoParada, setMotivoParada] = useState<MotivoOciosidade | ''>('');
  const [estacaInicial, setEstacaInicial] = useState('');
  const [estacaFinal, setEstacaFinal] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  const handleEquipmentSelect = (id: string) => {
    setEquipmentId(id);
    const eq = equipments.find((e) => e.id === id);
    if (eq) {
      setInitialHourmeter(eq.current_hourmeter);
      setFinalHourmeter(eq.current_hourmeter);
      setHorasProdutivas(0);
    }
  };

  const selectedFunc = funcionarios.find((f) => f.id === operadorId);
  const selectedEquip = equipments.find((e) => e.id === equipmentId);

  const executarSalvar = async () => {
    setShowPinModal(false);
    const result = await createBDE({
      obra_id: obraId,
      equipment_id: equipmentId,
      operador_id: operadorId || undefined,
      date,
      operator_name: selectedFunc?.nome || 'Operador',
      client_name: obraSelecionada?.nome || 'Canteiro Central',
      work_location: selectedEquip?.name || 'Frente de Serviço',
      initial_hourmeter: initialHourmeter,
      final_hourmeter: finalHourmeter,
      total_hours: horasProdutivas,
      horas_produtivas: horasProdutivas,
      horas_ociosas: horasOciosas,
      motivo_parada: motivoParada || undefined,
      estaca_inicial: estacaInicial || undefined,
      estaca_final: estacaFinal || undefined,
      status_aprovacao: 'PENDENTE',
      fuel_liters: 0,
      service_description: description || 'Operação de campo',
      notes,
      status: 'SUBMITTED',
      assinado_por_pin: Boolean(selectedFunc?.pin_assinatura)
    });

    if (result.success) onSuccess();
  };

  return {
    activeTab, setActiveTab,
    obraId, setObraId,
    equipmentId, setEquipmentId,
    operadorId, setOperadorId,
    date, setDate,
    initialHourmeter, setInitialHourmeter,
    finalHourmeter, setFinalHourmeter,
    horasProdutivas, setHorasProdutivas,
    horasOciosas, setHorasOciosas,
    motivoParada, setMotivoParada,
    estacaInicial, setEstacaInicial,
    estacaFinal, setEstacaFinal,
    description, setDescription,
    notes, setNotes,
    showPinModal, setShowPinModal,
    handleEquipmentSelect,
    selectedFunc,
    selectedEquip,
    isSubmitting,
    error,
    limparErro,
    executarSalvar
  };
}
