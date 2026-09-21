import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useCreateManutencao } from '../../../hooks/useCreateManutencao';

interface ManutencaoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManutencaoForm: React.FC<ManutencaoFormProps> = ({ onSuccess, onCancel }) => {
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { createManutencao, isSubmitting, error, limparErro } = useCreateManutencao();

  const [maquinaId, setMaquinaId] = useState('');
  const [tipoServico, setTipoServico] = useState('Troca de Óleo do Motor');
  const [intervaloHoras, setIntervaloHoras] = useState<number>(250);
  const [ultimoHorimetro, setUltimoHorimetro] = useState<number>(0);
  const [mecanico, setMecanico] = useState('');

  const handleMaquinaSelect = (id: string) => {
    setMaquinaId(id);
    const equip = equipments.find((e) => e.id === id);
    if (equip) {
      setUltimoHorimetro(equip.current_hourmeter);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const result = await createManutencao({
      maquina_id: maquinaId,
      tipo_servico_nome: tipoServico,
      intervalo_horas: intervaloHoras,
      ultimo_horimetro_realizado: ultimoHorimetro,
      responsavel_mecanico: mecanico || undefined,
      status: 'EM_DIA'
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Máquina / Equipamento *</label>
        <select
          required
          value={maquinaId}
          onChange={(e) => handleMaquinaSelect(e.target.value)}
          disabled={loadingEquips || equipments.length === 0}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">{equipments.length === 0 ? 'Nenhuma máquina' : 'Selecione a máquina'}</option>
          {equipments.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.code} - {eq.name} ({eq.current_hourmeter.toFixed(1)}h)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Serviço *</label>
          <select
            value={tipoServico}
            onChange={(e) => setTipoServico(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Troca de Óleo do Motor">Troca de Óleo do Motor</option>
            <option value="Filtros Hidráulicos">Filtros Hidráulicos</option>
            <option value="Lubrificação Geral">Lubrificação Geral (Engraxamento)</option>
            <option value="Revisão Completa">Revisão Completa (Trem de Força)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Intervalo (Horas) *</label>
          <select
            value={intervaloHoras}
            onChange={(e) => setIntervaloHoras(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value={250}>250 horas (Padrão Óleo/Filtros)</option>
            <option value={500}>500 horas (Intermediária)</option>
            <option value={1000}>1000 horas (Geral/Hidráulico)</option>
            <option value={2000}>2000 horas (Overhaul Completo)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Último Horímetro Realizado *</label>
          <input
            type="number"
            step="0.1"
            required
            value={ultimoHorimetro}
            onChange={(e) => setUltimoHorimetro(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Mecânico / Oficina</label>
          <input
            placeholder="Ex: Oficina Central / Mecânico João"
            value={mecanico}
            onChange={(e) => setMecanico(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || equipments.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm"
        >
          {isSubmitting ? 'Salvando...' : 'Cadastrar Plano'}
        </button>
      </div>
    </form>
  );
};
