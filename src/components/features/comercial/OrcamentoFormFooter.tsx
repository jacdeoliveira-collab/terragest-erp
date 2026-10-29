import React from 'react';

interface OrcamentoFormFooterProps {
  subtotal: number;
  valorDesconto: number;
  valorTotal: number;
  salvando: boolean;
  clienteId: string;
  isEdicao: boolean;
  onCancel: () => void;
}

export const OrcamentoFormFooter: React.FC<OrcamentoFormFooterProps> = ({
  subtotal,
  valorDesconto,
  valorTotal,
  salvando,
  clienteId,
  isEdicao,
  onCancel
}) => {
  return (
    <>
      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="space-x-2 text-[11px] text-gray-600">
          <span>Subtotal: <b>R$ {subtotal.toFixed(2)}</b></span>
          {valorDesconto > 0 && <span className="text-amber-700">| Desconto: <b>(-) R$ {valorDesconto.toFixed(2)}</b></span>}
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
          {salvando ? 'Salvando...' : isEdicao ? 'Salvar Alterações' : 'Salvar Proposta'}
        </button>
      </div>
    </>
  );
};
