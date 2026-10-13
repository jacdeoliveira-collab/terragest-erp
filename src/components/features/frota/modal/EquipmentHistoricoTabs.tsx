import React, { useState } from 'react';
import { UserCheck, Fuel, Gauge, Truck, CheckCircle2 } from 'lucide-react';
import { EquipmentAbastecimentosTable } from './EquipmentAbastecimentosTable';
import { EquipmentServicosHorimetroTable } from './EquipmentServicosHorimetroTable';
import type { EquipmentHistoricoData } from '../../../../services/equipmentHistoricoConsolidador';

interface Props {
  data: EquipmentHistoricoData;
  activeTab?: 'operadores' | 'abastecimentos';
  onSelectTab?: (tab: 'operadores' | 'abastecimentos') => void;
}

export const EquipmentHistoricoTabs: React.FC<Props> = ({ data, activeTab, onSelectTab }) => {
  const [internalTab, setInternalTab] = useState<'operadores' | 'abastecimentos'>('operadores');
  const currentTab = activeTab ?? internalTab;
  const setTab = onSelectTab ?? setInternalTab;

  return (
    <div className="space-y-3">
      <div className="flex border-b border-gray-200 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('operadores')}
          className={`pb-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            currentTab === 'operadores' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Locações & Horímetros ({data.servicos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('abastecimentos')}
          className={`pb-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            currentTab === 'abastecimentos' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Histórico de Combustível ({data.abastecimentos.length})</span>
        </button>
      </div>

      {currentTab === 'operadores' ? (
        <div className="space-y-4">
          {/* Card Resumo de Rodagem & Deslocamento sem Faturar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Horas Faturadas</div>
                <div className="font-mono font-bold text-gray-900">{data.totalHorasTrabalhadas.toFixed(1)} h</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Sem Faturar (Deslocamento)</div>
                <div className="font-mono font-bold text-amber-800">+{data.totalHorasDeslocamento.toFixed(1)} h</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Total Rodado (Horímetro)</div>
                <div className="font-mono font-bold text-blue-900">{data.totalHorasRodadas.toFixed(1)} h</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Eficiência Operacional</div>
                <div className="font-mono font-bold text-purple-900">{data.eficienciaFaturamento.toFixed(1)}% faturado</div>
              </div>
            </div>
          </div>

          {data.operadores.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.operadores.map((op, idx) => (
                <div key={idx} className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] text-gray-700 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold">{op.nome}:</span>
                  <span className="font-mono text-emerald-800">{op.horas.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          )}

          <EquipmentServicosHorimetroTable itens={data.servicosDeslocamento} />
        </div>
      ) : (
        <EquipmentAbastecimentosTable abastecimentos={data.abastecimentos} />
      )}
    </div>
  );
};
