import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useCreateAbastecimento } from '../../../hooks/useCreateAbastecimento';
import { useObraContext } from '../../../contexts/ObraContext';
import { AbastecimentoValores } from './AbastecimentoValores';
import { ObraNaoSelecionadaAviso } from './ObraNaoSelecionadaAviso';
import type { TipoCombustivel } from '../../../types/abastecimento.types';

interface AbastecimentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AbastecimentoForm: React.FC<AbastecimentoFormProps> = ({ onSuccess, onCancel }) => {
  const { obraSelecionada } = useObraContext();
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { data: funcionarios, isLoading: loadingFuncs } = useFuncionarios({ onlyActives: true });
  const { createAbastecimento, isSubmitting, error, limparErro } = useCreateAbastecimento();

  const [maquinaId, setMaquinaId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 16));
  const [horimetro, setHorimetro] = useState<number>(0);
  const [tipoCombustivel, setTipoCombustivel] = useState<TipoCombustivel>('DIESEL_S10');
  const [litros, setLitros] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);

  if (!obraSelecionada) {
    return <ObraNaoSelecionadaAviso onCancel={onCancel} />;
  }

  const handleMaquinaSelect = (id: string) => {
    setMaquinaId(id);
    const equip = equipments.find((e) => e.id === id);
    if (equip) setHorimetro(equip.current_hourmeter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const result = await createAbastecimento({
      obra_id: obraSelecionada.id,
      maquina_id: maquinaId,
      operador_id: operadorId || undefined,
      data: data.slice(0, 10),
      horimetro_momento: horimetro,
      tipo_combustivel: tipoCombustivel,
      quantidade_litros: litros,
      valor_total: valorTotal
    });

    if (result.success) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left text-xs">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Máquina (Ativa) *</label>
          <select
            required
            value={maquinaId}
            onChange={(e) => handleMaquinaSelect(e.target.value)}
            disabled={loadingEquips || equipments.length === 0}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
          >
            <option value="">{equipments.length === 0 ? 'Nenhuma máquina ativa' : 'Selecione a máquina'}</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.code} - {eq.name} ({eq.current_hourmeter.toFixed(1)}h)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Operador / Motorista (Ativo) *</label>
          <select
            required
            value={operadorId}
            onChange={(e) => setOperadorId(e.target.value)}
            disabled={loadingFuncs || funcionarios.length === 0}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
          >
            <option value="">{funcionarios.length === 0 ? 'Nenhum operador ativo' : 'Selecione o operador'}</option>
            {funcionarios.map((fn) => (
              <option key={fn.id} value={fn.id}>{fn.nome} ({fn.cargo.replace('_', ' ')})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Data / Hora *</label>
          <input
            type="datetime-local"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Horímetro no Abastecimento *</label>
          <input
            type="number"
            step="0.1"
            required
            value={horimetro}
            onChange={(e) => setHorimetro(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono"
          />
        </div>
      </div>

      <AbastecimentoValores
        tipoCombustivel={tipoCombustivel}
        setTipoCombustivel={setTipoCombustivel}
        litros={litros}
        setLitros={setLitros}
        valorTotal={valorTotal}
        setValorTotal={setValorTotal}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || equipments.length === 0}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
        >
          {isSubmitting ? 'Salvando...' : 'Registrar Abastecimento'}
        </button>
      </div>
    </form>
  );
};
