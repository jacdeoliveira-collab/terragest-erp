import React from 'react';
import { Calendar, Gauge, ArrowRight, Truck } from 'lucide-react';
import type { ServicoComDeslocamento } from '../../../../utils/equipmentHorimetroDeslocamento';

interface Props {
  itens: ServicoComDeslocamento[];
}

export const EquipmentServicosHorimetroTable: React.FC<Props> = ({ itens }) => {
  if (itens.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-gray-400">
        Nenhuma locação ou apontamento registrado para esta máquina até o momento.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
          <tr>
            <th className="p-2.5">Data / Período</th>
            <th className="p-2.5">Cliente / Obra</th>
            <th className="p-2.5">Operador</th>
            <th className="p-2.5 text-center">Horímetro (Início → Fim)</th>
            <th className="p-2.5 text-right">Horas Faturadas</th>
            <th className="p-2.5 text-center">Deslocamento (Sem Faturar)</th>
            <th className="p-2.5 text-right">Faturamento</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {itens.map((item) => {
            const s = item.servico;
            return (
              <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-gray-800">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{s.data_inicio}</span>
                  </div>
                </td>
                <td className="p-2.5 font-medium text-gray-900">
                  <div>{s.cliente_nome || '-'}</div>
                  {s.obra_nome && <div className="text-[10px] text-gray-400">{s.obra_nome}</div>}
                </td>
                <td className="p-2.5 text-gray-700">{s.operador_nome || '-'}</td>
                <td className="p-2.5 text-center font-mono">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                    <Gauge className="w-3 h-3 text-slate-500" />
                    <span>{item.horimetroInicial.toFixed(1)}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    <span>{item.horimetroFinal.toFixed(1)}</span>
                  </div>
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                  {item.horasFaturadas.toFixed(1)} h
                </td>
                <td className="p-2.5 text-center">
                  {item.houveDeslocamento ? (
                    <span
                      title={`Deslocamento entre o final do serviço anterior (${item.horimetroAnteriorFinal?.toFixed(1)}h) e o início deste (${item.horimetroInicial.toFixed(1)}h)`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-mono font-semibold text-[10px]"
                    >
                      <Truck className="w-3 h-3 text-amber-600" />
                      +{item.deslocamentoHoras.toFixed(1)} h rodadas
                    </span>
                  ) : item.horimetroAnteriorFinal !== undefined ? (
                    <span className="text-[10px] text-emerald-600 font-mono">0.0 h (Direto)</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">-</span>
                  )}
                </td>
                <td className="p-2.5 text-right font-mono text-emerald-700 font-semibold whitespace-nowrap">
                  R$ {Number(s.faturamento_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
