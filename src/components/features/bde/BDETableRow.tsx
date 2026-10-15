import React from 'react';
import { Compass, AlertTriangle, FileDown } from 'lucide-react';
import type { DailyBulletin } from '../../../types/bde.types';
import type { TenantMaster } from '../../../types/tenant.types';
import { exportBdePdf } from '../../../services/exportBdePdfService';

interface BDETableRowProps {
  item: DailyBulletin;
  equipNome?: string;
  empresa: TenantMaster | null;
  obraNome?: string;
}

export const BDETableRow: React.FC<BDETableRowProps> = ({ item, equipNome, empresa, obraNome }) => {
  const horasProd = item.horas_produtivas !== undefined ? Number(item.horas_produtivas) : (Number(item.total_hours) || 0);
  const horasOciosas = Number(item.horas_ociosas) || 0;
  const statusAprov = item.status_aprovacao || 'PENDENTE';

  return (
    <tr className="hover:bg-gray-50/60">
      <td className="p-3 font-mono font-medium text-gray-900">{item.date}</td>
      <td className="p-3">
        <div className="font-bold font-mono text-emerald-700">
          {equipNome || item.equipment_code || item.equipment_name || item.equipment_id.slice(0, 8)}
        </div>
        <div className="text-[11px] text-gray-500">{item.operador_nome || item.operator_name}</div>
      </td>
      <td className="p-3">
        {item.estaca_inicial || item.estaca_final ? (
          <div className="flex items-center gap-1 font-mono text-gray-800">
            <Compass className="w-3 h-3 text-emerald-600" />
            <span>{item.estaca_inicial || '—'} &rarr; {item.estaca_final || '—'}</span>
          </div>
        ) : <span className="text-gray-400 font-mono">—</span>}
      </td>
      <td className="p-3 text-right font-mono font-bold text-gray-900">{horasProd.toFixed(1)}h</td>
      <td className="p-3 text-right font-mono">
        {horasOciosas > 0 ? (
          <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />+{horasOciosas.toFixed(1)}h
          </span>
        ) : <span className="text-emerald-700 font-semibold">0.0h</span>}
      </td>
      <td className="p-3 max-w-xs truncate">
        {item.motivo_parada && <span className="font-semibold text-rose-700 mr-1">[{item.motivo_parada}]</span>}
        <span className="text-gray-600">{item.service_description}</span>
      </td>
      <td className="p-3 text-center">
        {statusAprov === 'APROVADO' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">APROVADO</span>}
        {statusAprov === 'REJEITADO' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">REJEITADO</span>}
        {statusAprov === 'PENDENTE' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PENDENTE</span>}
      </td>
      <td className="p-3 text-center">
        <button
          onClick={() => exportBdePdf({
            bde: item,
            equipamentoNome: equipNome,
            operadorNome: item.operador_nome || item.operator_name,
            empresa,
            obraNome
          })}
          className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg font-semibold cursor-pointer transition-colors shadow-2xs"
          title="Exportar BDE Individual em PDF"
        >
          <FileDown className="w-3.5 h-3.5 text-emerald-600" />
          <span>PDF</span>
        </button>
      </td>
    </tr>
  );
};
