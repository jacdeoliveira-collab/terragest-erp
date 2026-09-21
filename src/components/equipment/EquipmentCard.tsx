import React from 'react';
import { Truck, Plane, CheckCircle2, Wrench, AlertCircle } from 'lucide-react';
import type { Equipment } from '../../types/equipment.types';

interface EquipmentCardProps {
  equipment: Equipment;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const isDrone = equipment.category === 'AGRICULTURAL_DRONE';

  const statusConfig = {
    AVAILABLE: { label: 'Disponível', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    IN_OPERATION: { label: 'Em Operação', color: 'bg-blue-950/60 text-blue-400 border-blue-800/60', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    MAINTENANCE: { label: 'Manutenção', color: 'bg-amber-950/60 text-amber-400 border-amber-800/60', icon: <Wrench className="w-3.5 h-3.5" /> },
    INACTIVE: { label: 'Inativo', color: 'bg-rose-950/60 text-rose-400 border-rose-800/60', icon: <AlertCircle className="w-3.5 h-3.5" /> }
  }[equipment.status];

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-lg">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDrone ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-400' : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'}`}>
              {isDrone ? <Plane className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">{equipment.code}</span>
              <h3 className="font-semibold text-slate-100 text-base">{equipment.name}</h3>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-b border-slate-800/60 my-2">
          <div>
            <span className="text-slate-500 block">Modelo</span>
            <span className="font-medium text-slate-300">{equipment.model}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Nº de Série</span>
            <span className="font-mono text-slate-300 truncate block">{equipment.serial_number}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] text-slate-500 block">Horímetro Atual</span>
          <span className="text-lg font-bold text-white font-mono">{equipment.current_hourmeter.toFixed(1)}h</span>
        </div>

        {isDrone && equipment.battery_cycles !== undefined && (
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Ciclos Bateria</span>
            <span className="text-sm font-semibold text-indigo-400 font-mono">{equipment.battery_cycles} c</span>
          </div>
        )}
      </div>
    </div>
  );
};
