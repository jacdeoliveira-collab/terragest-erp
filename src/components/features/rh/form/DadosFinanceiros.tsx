import React, { useEffect } from 'react';

interface DadosFinanceirosProps {
  salarioBase: number;
  setSalarioBase: (val: number) => void;
  custoHoraNormal: number;
  setCustoHoraNormal: (val: number) => void;
  valorHoraExtra: number;
  setValorHoraExtra: (val: number) => void;
  limiteHorasDiario: number;
  setLimiteHorasDiario: (val: number) => void;
}

export const DadosFinanceiros: React.FC<DadosFinanceirosProps> = ({
  salarioBase,
  setSalarioBase,
  custoHoraNormal,
  setCustoHoraNormal,
  valorHoraExtra,
  setValorHoraExtra,
  limiteHorasDiario,
  setLimiteHorasDiario
}) => {
  // Watcher para cálculo automático da hora extra CLT (base 220h + 50%)
  useEffect(() => {
    const valorBase = Number(salarioBase) || 0;
    const horaNormal = valorBase > 0 ? Number((valorBase / 220).toFixed(2)) : 0;
    const calculoHoraExtra = valorBase > 0 ? Number(((valorBase / 220) * 1.5).toFixed(2)) : 0;

    setValorHoraExtra(calculoHoraExtra);
    if (setCustoHoraNormal) {
      setCustoHoraNormal(horaNormal);
    }
  }, [salarioBase, setValorHoraExtra, setCustoHoraNormal]);

  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
      <div className="flex items-center justify-between">
        <h5 className="font-bold text-[11px] text-gray-800 uppercase tracking-wider">
          Parâmetros de Folha e Banco de Horas
        </h5>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          CLT (220h + 50%)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Salário Base (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={salarioBase}
            onChange={(e) => setSalarioBase(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Custo Hora Normal (R$)</label>
          <input
            type="number"
            step="0.01"
            readOnly
            disabled
            value={custoHoraNormal}
            className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg font-mono text-gray-700 cursor-not-allowed select-none"
            title="Calculado automaticamente: Salário Base / 220"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Valor Hora Extra (R$) <span className="text-emerald-600 font-bold">(Auto)</span>
          </label>
          <input
            type="number"
            step="0.01"
            readOnly
            disabled
            value={valorHoraExtra}
            className="w-full px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-200 rounded-lg font-mono font-bold text-emerald-800 cursor-not-allowed select-none"
            title="Calculado automaticamente: (Salário Base / 220) * 1.5"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Limite Diário (Horas)</label>
          <input
            type="number"
            step="0.5"
            value={limiteHorasDiario}
            onChange={(e) => setLimiteHorasDiario(parseFloat(e.target.value) || 8)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
