import React from 'react';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';
import { formatMeasurementValue } from '../../../../utils/equipmentMeasurement';

interface Props {
  abastecimentos: AbastecimentoItem[];
}

export const EquipmentAbastecimentosTable: React.FC<Props> = ({ abastecimentos }) => {
  if (abastecimentos.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-gray-400">
        Nenhum abastecimento registrado diretamente para esta máquina.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
          <tr>
            <th className="p-2.5">Data</th>
            <th className="p-2.5">Combustível</th>
            <th className="p-2.5 text-right">Horímetro / KM</th>
            <th className="p-2.5 text-right">Litros</th>
            <th className="p-2.5 text-right">Valor Total</th>
            <th className="p-2.5">Posto / Origem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {abastecimentos.map((ab: AbastecimentoItem) => (
            <tr key={ab.id} className="hover:bg-gray-50/50">
              <td className="p-2.5 font-mono text-[11px]">{ab.data}</td>
              <td className="p-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {ab.tipo_combustivel}
                </span>
              </td>
              <td className="p-2.5 text-right font-mono text-gray-700">
                {formatMeasurementValue(ab.horimetro_momento, { name: ab.maquina_nome, code: ab.maquina_codigo })}
              </td>
              <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                {Number(ab.quantidade_litros || 0).toFixed(1)} L
              </td>
              <td className="p-2.5 text-right font-mono font-semibold text-rose-700">
                R$ {Number(ab.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-2.5 text-gray-600 truncate max-w-[150px]">
                {ab.posto_fornecedor || ab.origem || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
