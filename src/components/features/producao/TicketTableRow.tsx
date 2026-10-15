import React from 'react';
import type { ApontamentoViagemItem, TipoMaterialProducao } from '../../../types/producao.types';

export function renderMaterialBadge(tipo: TipoMaterialProducao) {
  const styles: Record<TipoMaterialProducao, string> = {
    SOLO_COMUM: 'bg-amber-50 text-amber-800 border-amber-200',
    ROCHA: 'bg-slate-100 text-slate-800 border-slate-300',
    BOTA_FORA: 'bg-rose-50 text-rose-800 border-rose-200',
    ATERRO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    SAIBRO: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    AREIA: 'bg-blue-50 text-blue-800 border-blue-200',
    BRITA: 'bg-purple-50 text-purple-800 border-purple-200'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[tipo] || 'bg-gray-100 text-gray-800'}`}>
      {tipo.replace('_', ' ')}
    </span>
  );
}

export const TicketTableRow: React.FC<{ item: ApontamentoViagemItem }> = ({ item }) => {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3 font-mono font-bold text-emerald-800">
        <div>{item.numero_ticket}</div>
        <div className="text-[10px] font-normal text-gray-400">
          {new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>
      <td className="p-3 font-medium text-gray-900">
        <div>{item.caminhao_codigo}</div>
        <div className="text-[10px] text-gray-400 font-mono">
          {item.caminhao_placa ? `Placa: ${item.caminhao_placa}` : item.caminhao_nome}
        </div>
      </td>
      <td className="p-3 text-gray-700">{item.escavadeira_codigo}</td>
      <td className="p-3 text-center">{renderMaterialBadge(item.material_tipo)}</td>
      <td className="p-3 text-right font-mono font-bold text-gray-900">{Number(item.volume_m3).toFixed(1)} m³</td>
      <td className="p-3 text-[11px] text-gray-500">
        <span>{item.origem_estaca || 'Corte'} &rarr; {item.destino_estaca || 'Aterro'}</span>
        {item.dmt_km ? <span className="block text-[10px] text-gray-400 font-mono">DMT: {item.dmt_km} km</span> : null}
      </td>
    </tr>
  );
};
