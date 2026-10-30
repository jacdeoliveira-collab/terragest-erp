import React from 'react';

interface OrcamentoFormFooterProps {
  subtotal: number;
  valorMobilizacao: number;
  valorDesconto: number;
  valorTotal: number;
  salvando: boolean;
  clienteId: string;
  isEdicao: boolean;
  onCancel: () => void;
}

export const OrcamentoFormFooter: React.FC<OrcamentoFormFooterProps> = ({
  subtotal,
  valorMobilizacao,
  valorDesconto,
  valorTotal,
  salvando,
  clienteId,
  isEdicao,
  onCancel
}) => {
  return (
    <>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-700">
          <span>Horas de Máquinas: <b>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></span>
          {valorMobilizacao > 0 && (
            <span className="text-blue-700">
              | + Prancha/Mobilização: <b>R$ {valorMobilizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>
            </span>
          )}
          {valorDesconto > 0 && (
            <span className="text-amber-700">
              | - Desconto: <b>R$ {valorDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>
            </span>
          )}
        </div>
        <span className="font-mono font-bold text-emerald-800 text-sm">
          Total Proposta: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando || !clienteId}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : isEdicao ? 'Salvar Alterações' : 'Salvar Proposta Comercial'}
        </button>
      </div>
    </>
  );
};
