import React, { useState } from 'react';
import { AlertCircle, Wrench, DollarSign } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useObras } from '../../../hooks/useObras';
import { useCategoriasCustos } from '../../../hooks/useCategoriasCustos';
import { useCreateManutencao } from '../../../hooks/useCreateManutencao';
import { ManutencaoDadosTab } from './ManutencaoDadosTab';
import { ManutencaoCustosTab } from './ManutencaoCustosTab';
import type { TipoManutencao } from '../../../types/manutencao.types';
import { isVehicleOrTruck } from '../../../utils/equipmentMeasurement';

interface ManutencaoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManutencaoForm: React.FC<ManutencaoFormProps> = ({ onSuccess, onCancel }) => {
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { obras, loading: loadingObras } = useObras();
  const { categorias, loading: loadingCategorias } = useCategoriasCustos('MANUTENCAO');
  const { createManutencao, isSubmitting, error, limparErro } = useCreateManutencao();

  const [activeTab, setActiveTab] = useState<'dados' | 'custos'>('dados');
  const [maquinaId, setMaquinaId] = useState('');
  const [tipoManutencao, setTipoManutencao] = useState<TipoManutencao>('PREVENTIVA');
  const [dataServico, setDataServico] = useState(new Date().toISOString().slice(0, 10));
  const [descricaoServico, setDescricaoServico] = useState('');
  const [intervaloHoras, setIntervaloHoras] = useState<number>(250);
  const [ultimoHorimetro, setUltimoHorimetro] = useState<number>(0);
  const [mecanico, setMecanico] = useState('');
  const [obraId, setObraId] = useState('');
  const [categoriaCustoId, setCategoriaCustoId] = useState('');
  const [valorPecas, setValorPecas] = useState<number>(0);
  const [valorMaoObra, setValorMaoObra] = useState<number>(0);

  const handleMaquinaSelect = (id: string) => {
    setMaquinaId(id);
    const equip = equipments.find((e) => e.id === id);
    if (equip) {
      setUltimoHorimetro(equip.current_hourmeter);
      setIntervaloHoras(isVehicleOrTruck(equip) ? 10000 : 250);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const result = await createManutencao({
      maquina_id: maquinaId,
      tipo_manutencao: tipoManutencao,
      tipo_servico_nome: descricaoServico.slice(0, 60),
      descricao_servico: descricaoServico,
      data_servico: dataServico,
      intervalo_horas: intervaloHoras,
      ultimo_horimetro_realizado: ultimoHorimetro,
      responsavel_mecanico: mecanico || undefined,
      obra_id: obraId || undefined,
      categoria_custo_id: categoriaCustoId || undefined,
      valor_pecas: valorPecas,
      valor_mao_obra: valorMaoObra,
      status: 'EM_DIA'
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex border-b border-gray-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('dados')}
          className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'dados' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Dados da Manutenção</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custos')}
          className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'custos' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Apropriação de Custos</span>
        </button>
      </div>

      <div className="min-h-[220px]">
        {activeTab === 'dados' ? (
          <ManutencaoDadosTab
            maquinaId={maquinaId} setMaquinaId={setMaquinaId}
            tipoManutencao={tipoManutencao} setTipoManutencao={setTipoManutencao}
            dataServico={dataServico} setDataServico={setDataServico}
            descricaoServico={descricaoServico} setDescricaoServico={setDescricaoServico}
            ultimoHorimetro={ultimoHorimetro} setUltimoHorimetro={setUltimoHorimetro}
            intervaloHoras={intervaloHoras} setIntervaloHoras={setIntervaloHoras}
            mecanico={mecanico} setMecanico={setMecanico}
            equipments={equipments} loadingEquips={loadingEquips}
            onMaquinaSelect={handleMaquinaSelect}
          />
        ) : (
          <ManutencaoCustosTab
            obraId={obraId} setObraId={setObraId}
            categoriaCustoId={categoriaCustoId} setCategoriaCustoId={setCategoriaCustoId}
            valorPecas={valorPecas} setValorPecas={setValorPecas}
            valorMaoObra={valorMaoObra} setValorMaoObra={setValorMaoObra}
            obras={obras} loadingObras={loadingObras}
            categorias={categorias} loadingCategorias={loadingCategorias}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !maquinaId}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Ordem de Serviço'}
        </button>
      </div>
    </form>
  );
};
