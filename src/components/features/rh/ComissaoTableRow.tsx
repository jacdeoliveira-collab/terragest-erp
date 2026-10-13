import React from 'react';
import { FileText, Tractor, HardHat } from 'lucide-react';
import type { ItemComissaoOperador } from '../../../types/rh.types';
import { gerarReciboPagamentoPDF } from '../../../utils/reciboPagamentoPdf';

interface ComissaoTableRowProps {
  item: ItemComissaoOperador;
  periodo: { dataInicio: string; dataFim: string };
  onUpdateValorHora: (operadorId: string, valor: number) => void;
}

export const ComissaoTableRow: React.FC<ComissaoTableRowProps> = ({
  item,
  periodo,
  onUpdateValorHora
}) => {
  return (
    <tr className="hover:bg-amber-50/40 transition-colors border-b border-gray-100 text-xs">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.operadorNome}</p>
            <p className="text-[10px] text-gray-400">
              {item.documento ? `CPF: ${item.documento}` : item.cargo || 'Operador'} • {item.quantidadeBoletins} BDE(s)
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        {item.maquinasOperadas.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {item.maquinasOperadas.map((maq, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium"
              >
                <Tractor className="w-2.5 h-2.5 text-amber-600" />
                {maq}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic text-[11px]">Nenhuma máquina vinculada</span>
        )}
      </td>

      <td className="px-4 py-3 font-semibold text-gray-800 text-center">
        <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-bold">
          {item.totalHorasTrabalhadas.toFixed(2)} h
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1 max-w-[130px]">
          <span className="text-gray-500 font-medium">R$</span>
          <input
            type="number"
            min="0"
            step="0.50"
            value={item.valorHoraComissao || ''}
            placeholder="0,00"
            onChange={(e) => onUpdateValorHora(item.operadorId, parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-900 font-semibold focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-right outline-none"
          />
        </div>
      </td>

      <td className="px-4 py-3 font-bold text-emerald-700 text-right text-sm">
        R$ {item.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>

      <td className="px-4 py-3 text-center">
        <button
          onClick={() => gerarReciboPagamentoPDF(item, periodo)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
          title="Emitir Recibo de Pagamento em PDF"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Recibo</span>
        </button>
      </td>
    </tr>
  );
};
