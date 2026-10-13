import React from 'react';
import { DollarSign, Clock, Fuel, TrendingUp } from 'lucide-react';
import type { Equipment } from '../../../../types/equipment.types';
import type { EquipmentHistoricoData } from '../../../../services/equipmentHistoricoConsolidador';
import { getMeasurementLabel, formatMeasurementValue } from '../../../../utils/equipmentMeasurement';

interface Props {
  equipment: Equipment;
  data: EquipmentHistoricoData;
  activeTab?: 'operadores' | 'abastecimentos';
  onSelectTab?: (tab: 'operadores' | 'abastecimentos') => void;
}

export const EquipmentHistoricoHeader: React.FC<Props> = ({ equipment, data, activeTab, onSelectTab }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-left">
      <button
        type="button"
        onClick={() => onSelectTab?.('operadores')}
        title="Clique para ver o histórico de apontamentos, horímetros e deslocamento"
        className={`border rounded-xl p-3 text-left transition-all cursor-pointer ${
          activeTab === 'operadores' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs' : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          <span>{getMeasurementLabel(equipment, 'atual')}</span>
        </div>
        <div className="text-base font-bold font-mono text-slate-800">
          {formatMeasurementValue(equipment.current_hourmeter, equipment)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          {data.totalHorasTrabalhadas.toFixed(1)}h fat.
          {data.totalHorasDeslocamento > 0 && ` | +${data.totalHorasDeslocamento.toFixed(1)}h desl.`}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab?.('operadores')}
        title="Clique para ver o faturamento de cada locação"
        className={`border rounded-xl p-3 text-left transition-all cursor-pointer ${
          activeTab === 'operadores' ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' : 'bg-emerald-50/60 hover:bg-emerald-100/50 border-emerald-200/80'
        }`}
      >
        <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium mb-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Faturamento Bruto</span>
        </div>
        <div className="text-base font-bold text-emerald-800 font-mono">
          R$ {data.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-emerald-600 font-medium">
          {data.servicos.length} locação(ões) • Ver extrato
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab?.('abastecimentos')}
        title="Clique para ver o histórico detalhado de diesel deste equipamento"
        className={`border rounded-xl p-3 text-left transition-all cursor-pointer ${
          activeTab === 'abastecimentos' ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xs' : 'bg-amber-50/60 hover:bg-amber-100/50 border-amber-200/80'
        }`}
      >
        <div className="flex items-center justify-between text-amber-700 text-[11px] font-medium mb-1">
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-amber-600" />
            <span>Combustível Consumido</span>
          </div>
          {activeTab === 'abastecimentos' && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">ATIVO</span>}
        </div>
        <div className="text-base font-bold text-amber-800 font-mono">
          R$ {data.dieselTotalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-amber-600 font-mono">
          {data.dieselTotalLitros.toFixed(1)} L • Ver abastecimentos
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab?.('operadores')}
        title="Clique para ver a margem e rentabilidade por serviço"
        className={`border rounded-xl p-3 text-left transition-all cursor-pointer ${
          activeTab === 'operadores' ? 'bg-blue-100/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs' : 'bg-blue-50/60 hover:bg-blue-100/50 border-blue-200/80'
        }`}
      >
        <div className="flex items-center gap-1.5 text-blue-700 text-[11px] font-medium mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Lucro Líquido Real</span>
        </div>
        <div className="text-base font-bold text-blue-800 font-mono">
          R$ {data.lucroLiquidoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-blue-600 font-medium">
          Margem: {data.margemLucroGeral.toFixed(1)}% • Ver detalhes
        </div>
      </button>
    </div>
  );
};
