import React from 'react';

interface ServicoFinanceiroCellProps {
  faturamentoBruto: number;
  valorAdiantamento: number;
  temAdiantamento: boolean;
  faltaReceber: number;
}

export const ServicoFinanceiroCell: React.FC<ServicoFinanceiroCellProps> = ({
  faturamentoBruto,
  valorAdiantamento,
  temAdiantamento,
  faltaReceber
}) => {
  return (
    <td className="py-3 px-4 font-mono text-right">
      <span className="font-bold text-gray-900 block">
        R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
      {temAdiantamento && (
        <span className="text-[10px] text-emerald-600 font-semibold block">
          Recebido: R$ {valorAdiantamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      )}
      {faltaReceber > 0 ? (
        <span className="text-[10px] text-amber-700 font-semibold block">
          Falta: R$ {faltaReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ) : (
        temAdiantamento && <span className="text-[10px] text-teal-600 font-medium block">Quitado</span>
      )}
    </td>
  );
};
