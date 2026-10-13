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
            <th className="p-3.5">ID / Doc</th>
            <th className="p-3.5">Data</th>
            <th className="p-3.5">Máquina / Veículo</th>
            <th className="p-3.5">Combustível</th>
            <th className="p-3.5 text-right">Horímetro / KM</th>
            <th className="p-3.5 text-right">Litros</th>
            <th className="p-3.5 text-right">Custo Total</th>
            <th className="p-3.5 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {data.map((item: AbastecimentoItem) => {
            const shortId = item.id.length > 8 ? item.id.slice(0, 8).toUpperCase() : item.id.toUpperCase();
            return (
              <tr
                key={item.id}
                className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                onClick={() => onVerDetalhes?.(item)}
                title="Clique para ver os detalhes completos e comprovante"
              >
                <td className="p-3.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-800 border border-gray-200 text-[11px]">
                      #{shortId}
                    </span>
                    {item.foto_comprovante && (
                      <span className="inline-flex items-center text-emerald-700" title="Possui comprovante fiscal anexado">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3.5 font-mono font-medium text-gray-900">{item.data}</td>
                <td className="p-3.5">
                  <div className="font-mono font-bold text-emerald-700 hover:underline">
                    {item.maquina_codigo || item.maquina_nome || '-'}
                  </div>
                  {item.cliente_nome && (
                    <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      Cliente: {item.cliente_nome}
                    </div>
                  )}
                  {item.origem === 'COMBOIO' && (
                    <div className="text-[10px] text-amber-700 font-semibold">
                      Melosa: {item.comboio_codigo || item.comboio_nome || 'Comboio'}
                    </div>
                  )}
                  {((item.qtd_oleo_litros || 0) > 0 || (item.qtd_graxa_kg || 0) > 0) && (
                    <div className="text-[10px] text-slate-500">
                      {item.qtd_oleo_litros ? `${item.qtd_oleo_litros}L óleo ` : ''}
                      {item.qtd_graxa_kg ? `${item.qtd_graxa_kg}kg graxa` : ''}
                    </div>
                  )}
                </td>
                <td className="p-3.5 text-gray-600">{item.tipo_combustivel.replace('_', ' ')}</td>
                <td className="p-3.5 text-right font-mono text-gray-600">
                  {item.horimetro_momento ? formatMeasurementValue(item.horimetro_momento, { name: item.maquina_nome, code: item.maquina_codigo }) : '-'}
                </td>
                <td className="p-3.5 text-right font-mono font-bold text-emerald-800">
                  {Number(item.quantidade_litros).toFixed(1)} L
                </td>
                <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                  R$ {Number(item.valor_total).toFixed(2)}
                </td>
                <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    {onVerDetalhes && (
                      <button
                        type="button"
                        onClick={() => onVerDetalhes(item)}
                        title="Ver Detalhes do Abastecimento"
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onEditar && (
                      <button
                        type="button"
                        onClick={() => onEditar(item)}
                        title="Editar Abastecimento"
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onExcluir && (
                      <button
                        type="button"
                        onClick={() => onExcluir(item)}
                        title="Excluir Abastecimento"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
