import React from 'react';
import { HardHat, Calendar, Search, CheckCircle2 } from 'lucide-react';
import { useObras } from '../../../hooks/useObras';

interface MedicaoFiltroTabProps {
  obraId: string;
  setObraId: (id: string) => void;
  competencia: string;
  setCompetencia: (val: string) => void;
  onBuscar: () => void;
  carregando: boolean;
  totalBdesEncontrados: number;
}

export const MedicaoFiltroTab: React.FC<MedicaoFiltroTabProps> = ({
  obraId,
  setObraId,
  competencia,
  setCompetencia,
  onBuscar,
  carregando,
  totalBdesEncontrados
}) => {
  const { obras, loading: loadingObras } = useObras();

  const obrasEmAndamento = obras.filter(
    (o) => o.status === 'EM_ANDAMENTO' || o.status === 'ATIVA'
  );
  const obrasExibidas = obrasEmAndamento.length > 0 ? obrasEmAndamento : obras;

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1">
        <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          Competência e Centro de Custo para Faturamento
        </h4>
        <p className="text-[11px] text-blue-700">
          Selecione a obra e o mês de medição. O sistema buscará apenas BDEs aprovados pela fiscalização que ainda não foram faturados.
        </p>
      </div>

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
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{loadingObras ? 'Carregando obras...' : 'Selecione a obra...'}</option>
            {obrasExibidas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome} ({o.cliente_nome || o.cliente || 'Cliente'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Mês / Ano de Referência (Competência) *
          </label>
          <input
            type="month"
            required
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBuscar}
          disabled={!obraId || !competencia || carregando}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{carregando ? 'Buscando BDEs...' : 'Localizar BDEs Aprovados'}</span>
        </button>

        {totalBdesEncontrados > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{totalBdesEncontrados} BDE(s) aprovado(s) prontos para medição</span>
          </div>
        )}
      </div>
    </div>
  );
};
