import React from 'react';
import { ArrowDownLeft, ArrowUpRight, FileText, Scale } from 'lucide-react';
import type { MovimentacaoAlmoxarifadoItem } from '../../../types/almoxarifado.types';

export const MovimentacaoTableRow: React.FC<{ item: MovimentacaoAlmoxarifadoItem }> = ({ item }) => {
  const isEntrada = item.tipo_movimentacao === 'ENTRADA';

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3 text-center">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
          isEntrada ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {isEntrada ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
          {isEntrada ? 'ENTRADA' : 'SAÍDA'}
        </span>
      </td>
      <td className="p-3 font-mono text-gray-600">{new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
      <td className="p-3">
        <div className="font-bold text-gray-900">{item.material_nome}</div>
        <div className="text-[11px] font-mono text-emerald-700 font-semibold">{item.quantidade.toLocaleString('pt-BR')} {item.unidade_medida}</div>
      </td>
      <td className="p-3 font-medium text-gray-800">
        <div>{item.fornecedor_nome || '—'}</div>
        <div className="text-[10px] text-gray-400 font-normal">{item.obra_nome}</div>
      </td>
      <td className="p-3">
        {item.numero_nf ? (
          <div className="flex items-center gap-1 font-mono text-gray-700">
            <FileText className="w-3 h-3 text-gray-400" />
            <span>NF: {item.numero_nf}</span>
          </div>
        ) : <span className="text-gray-400">—</span>}
      </td>
      <td className="p-3">
        {item.ticket_balanca_numero ? (
          <div className="font-mono">
            <div className="flex items-center gap-1 text-gray-900 font-bold">
              <Scale className="w-3 h-3 text-amber-600" />
              <span>#{item.ticket_balanca_numero}</span>
            </div>
            {item.peso_liquido_kg && <div className="text-[10px] text-gray-500">Líq: {item.peso_liquido_kg.toLocaleString('pt-BR')} kg</div>}
          </div>
        ) : <span className="text-gray-400">—</span>}
      </td>
    </tr>
  );
};
