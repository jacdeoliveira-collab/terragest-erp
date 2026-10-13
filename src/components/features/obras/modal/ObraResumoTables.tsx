import React, { useState } from 'react';
import { Fuel, Clock } from 'lucide-react';
import type { ObraDetalheHistoricoData } from '../../../../hooks/useObraDetalheHistorico';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';

interface Props {
  data: ObraDetalheHistoricoData;
}

export const ObraResumoTables: React.FC<Props> = ({ data }) => {
  const [tab, setTab] = useState<'abastecimentos' | 'boletins'>('abastecimentos');

  return (
    <div className="space-y-3">
      <div className="flex border-b border-gray-200 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('abastecimentos')}
          className={`pb-2 flex items-center gap-1.5 cursor-pointer ${tab === 'abastecimentos' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500'}`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Abastecimentos na Obra ({data.abastecimentos.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('boletins')}
          className={`pb-2 flex items-center gap-1.5 cursor-pointer ${tab === 'boletins' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Apontamentos de Horas ({data.boletins.length})</span>
        </button>
      </div>

      {tab === 'abastecimentos' ? (
        data.abastecimentos.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">Nenhum abastecimento alocado a esta obra.</div>
        ) : (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5">Máquina</th>
                  <th className="p-2.5 text-right">Litros</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5">Posto / Origem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {data.abastecimentos.map((a: AbastecimentoItem) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-mono text-[11px]">{a.data}</td>
                    <td className="p-2.5 font-medium">{a.maquina_codigo || a.maquina_nome || '-'}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{Number(a.quantidade_litros).toFixed(1)} L</td>
                    <td className="p-2.5 text-right font-mono text-rose-700 font-semibold">R$ {Number(a.valor_total).toFixed(2)}</td>
                    <td className="p-2.5 text-gray-500 truncate max-w-[120px]">{a.posto_fornecedor || a.origem || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        data.boletins.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">Nenhum apontamento de horas registrado para esta obra.</div>
        ) : (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5">Máquina / Equipamento</th>
                  <th className="p-2.5">Cliente / Operador</th>
                  <th className="p-2.5 text-right">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {data.boletins.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-mono text-[11px]">{b.date}</td>
                    <td className="p-2.5 font-medium">{b.equipment_code || 'Escavadeira'}</td>
                    <td className="p-2.5 text-gray-500 truncate max-w-[150px]">
                      {b.cliente_nome ? `${b.cliente_nome} (${b.operador_nome || 'Op.'})` : (b.operador_nome || '-')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-gray-900">{b.total_hours.toFixed(1)} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
