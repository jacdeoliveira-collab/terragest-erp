import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import type { ItemFolhaFechamento } from './fechamentoFolhaCalculos';

interface Props {
  itens: ItemFolhaFechamento[];
}

export const TabelaFechamentoFolha: React.FC<Props> = ({ itens }) => {
  if (itens.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">
        Nenhum colaborador encontrado para o período selecionado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
          <tr>
            <th className="p-3.5">Nome do Operador</th>
            <th className="p-3.5 text-right">Salário Base</th>
            <th className="p-3.5 text-right">Total Horas (Mês)</th>
            <th className="p-3.5 text-right">Horas Extras</th>
            <th className="p-3.5 text-right">Adicional H.E. (R$)</th>
            <th className="p-3.5 text-right">Custo Total</th>
            <th className="p-3.5 text-center">Status Limite</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {itens.map((item) => (
            <tr key={item.funcionarioId} className="hover:bg-gray-50/70 transition-colors">
              <td className="p-3.5 font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <span>{item.nome}</span>
                  {item.estourouLimite && (
                    <span
                      title="Ultrapassou limite diário de horas em apontamentos"
                      className="inline-flex p-0.5 rounded bg-rose-50 text-rose-600"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <span className="block text-[10px] text-gray-400 font-normal">
                  {item.cargo} • {item.diasApontados} {item.diasApontados === 1 ? 'dia apurado' : 'dias apurados'}
                </span>
              </td>

              <td className="p-3.5 text-right font-mono text-gray-700">
                R$ {item.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>

              <td className="p-3.5 text-right font-mono font-bold text-gray-800">
                {item.totalHorasTrabalhadas.toFixed(1)}h
              </td>

              <td className="p-3.5 text-right font-mono">
                {item.totalHorasExtras > 0 ? (
                  <span className="font-semibold text-rose-600">
                    +{item.totalHorasExtras.toFixed(1)}h
                  </span>
                ) : (
                  <span className="text-gray-400">0.0h</span>
                )}
              </td>

              <td className="p-3.5 text-right font-mono font-medium text-gray-700">
                R$ {item.adicionalHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>

              <td className="p-3.5 text-right font-mono font-bold">
                <span
                  className={
                    item.estourouLimite
                      ? 'text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded'
                      : 'text-gray-900'
                  }
                >
                  R$ {item.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </td>

              <td className="p-3.5 text-center">
                {item.estourouLimite ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <TrendingUp className="w-3 h-3 text-rose-600" />
                    Estourou Limite
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Normal
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
