import React from 'react';
import { Pencil, Trash2, Eye, FileText } from 'lucide-react';
import type { AbastecimentoItem } from '../../../types/abastecimento.types';
import { formatMeasurementValue } from '../../../utils/equipmentMeasurement';

interface AbastecimentoTableProps {
  data: AbastecimentoItem[];
  onVerDetalhes?: (item: AbastecimentoItem) => void;
  onEditar?: (item: AbastecimentoItem) => void;
  onExcluir?: (item: AbastecimentoItem) => void;
}

export const AbastecimentoTable: React.FC<AbastecimentoTableProps> = ({
  data,
  onVerDetalhes,
  onEditar,
  onExcluir
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
          <tr>
            <th className="p-3.5">Máquina / Veículo & Ações</th>
            <th className="p-3.5">Data</th>
            <th className="p-3.5 text-right">Litros</th>
            <th className="p-3.5 text-right">Valor / Litro</th>
            <th className="p-3.5 text-right">Custo Total</th>
            <th className="p-3.5">Combustível</th>
            <th className="p-3.5 text-right">Horímetro / KM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {data.map((item: AbastecimentoItem) => {
            const shortId = item.id.length > 8 ? item.id.slice(0, 8).toUpperCase() : item.id.toUpperCase();
            const litros = Number(item.quantidade_litros) || 0;
            const unitario = Number(item.valor_unitario) > 0 ? Number(item.valor_unitario) : (litros > 0 ? Number(item.valor_total) / litros : 0);
            return (
              <tr
                key={item.id}
                className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                onClick={() => onVerDetalhes?.(item)}
                title="Clique para ver os detalhes completos e comprovante"
              >
                <td className="p-3.5 min-w-[220px]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span onClick={() => onVerDetalhes?.(item)} className="font-mono font-bold text-emerald-700 hover:underline cursor-pointer">
                      {item.maquina_codigo || item.maquina_nome || '-'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono font-bold text-gray-700 border border-gray-200 text-[10px]">
                      #{shortId}
                    </span>
                    {item.foto_comprovante && (
                      <span className="inline-flex items-center text-emerald-700" title="Possui comprovante fiscal anexado">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  {item.cliente_nome && (
                    <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      Cliente: {item.cliente_nome}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-gray-100">
                    {onVerDetalhes && (
                      <button type="button" onClick={() => onVerDetalhes(item)} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer">
                        <Eye className="w-3 h-3 text-emerald-600" /><span>Ver</span>
                      </button>
                    )}
                    {onEditar && (
                      <button type="button" onClick={() => onEditar(item)} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer">
                        <Pencil className="w-3 h-3 text-amber-600" /><span>Editar</span>
                      </button>
                    )}
                    {onExcluir && (
                      <button type="button" onClick={() => onExcluir(item)} className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3.5 font-mono font-medium text-gray-900">{item.data}</td>
                <td className="p-3.5 text-right font-mono font-bold text-emerald-800">{litros.toFixed(1)} L</td>
                <td className="p-3.5 text-right font-mono text-gray-600">{unitario > 0 ? `R$ ${unitario.toFixed(2)}/L` : '-'}</td>
                <td className="p-3.5 text-right font-mono font-bold text-gray-900">R$ {Number(item.valor_total).toFixed(2)}</td>
                <td className="p-3.5 text-gray-600">{item.tipo_combustivel.replace('_', ' ')}</td>
                <td className="p-3.5 text-right font-mono text-gray-600">
                  {item.horimetro_momento ? formatMeasurementValue(item.horimetro_momento, { name: item.maquina_nome, code: item.maquina_codigo }) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
