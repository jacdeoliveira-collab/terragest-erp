import React from 'react';
import { Scale, Calculator } from 'lucide-react';

interface MovimentacaoBalancaTabProps {
  ticketBalancaNumero: string;
  setTicketBalancaNumero: (val: string) => void;
  pesoBrutoKg: number;
  setPesoBrutoKg: (val: number) => void;
  taraKg: number;
  setTaraKg: (val: number) => void;
  pesoLiquidoKg: number;
  setPesoLiquidoKg: (val: number) => void;
  onAplicarQuantidade?: (toneladas: number) => void;
}

export const MovimentacaoBalancaTab: React.FC<MovimentacaoBalancaTabProps> = ({
  ticketBalancaNumero,
  setTicketBalancaNumero,
  pesoBrutoKg,
  setPesoBrutoKg,
  taraKg,
  setTaraKg,
  pesoLiquidoKg,
  setPesoLiquidoKg,
  onAplicarQuantidade
}) => {
  const handleBrutoChange = (val: number) => {
    setPesoBrutoKg(val);
    const liquido = Math.max(0, val - taraKg);
    setPesoLiquidoKg(liquido);
  };

  const handleTaraChange = (val: number) => {
    setTaraKg(val);
    const liquido = Math.max(0, pesoBrutoKg - val);
    setPesoLiquidoKg(liquido);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 flex items-center gap-2">
        <Scale className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Conferência de pesagem rodoviária: o peso líquido é calculado automaticamente (Bruto - Tara).</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Número do Ticket de Balança</label>
        <input
          placeholder="Ex: TCK-BAL-08492"
          value={ticketBalancaNumero}
          onChange={(e) => setTicketBalancaNumero(e.target.value)}
          className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Peso Bruto (kg)</label>
          <input
            type="number"
            step="10"
            min="0"
            placeholder="Ex: 42000"
            value={pesoBrutoKg || ''}
            onChange={(e) => handleBrutoChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tara do Caminhão (kg)</label>
          <input
            type="number"
            step="10"
            min="0"
            placeholder="Ex: 14500"
            value={taraKg || ''}
            onChange={(e) => handleTaraChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
            <span>Peso Líquido (kg)</span>
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
          </label>
          <input
            type="number"
            step="10"
            value={pesoLiquidoKg || ''}
            onChange={(e) => setPesoLiquidoKg(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {pesoLiquidoKg > 0 && onAplicarQuantidade && (
        <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
          <span className="text-xs text-emerald-900 font-medium">
            Equivalente: <strong>{(pesoLiquidoKg / 1000).toFixed(3)} Toneladas</strong>
          </span>
          <button
            type="button"
            onClick={() => onAplicarQuantidade(Number((pesoLiquidoKg / 1000).toFixed(3)))}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Aplicar na Quantidade
          </button>
        </div>
      )}
    </div>
  );
};
