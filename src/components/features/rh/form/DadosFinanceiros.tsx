import React, { useState, useEffect } from 'react';
import { TipoRemuneracaoButtons, type TipoRemuneracao } from './TipoRemuneracaoButtons';

interface DadosFinanceirosProps {
  salarioBase: number;
  setSalarioBase: (val: number) => void;
  custoHoraNormal: number;
  setCustoHoraNormal: (val: number) => void;
  valorHoraExtra: number;
  setValorHoraExtra: (val: number) => void;
  limiteHorasDiario: number;
  setLimiteHorasDiario: (val: number) => void;
  diaPagamento?: number;
  setDiaPagamento?: (val: number) => void;
  diaFechamento?: number;
  setDiaFechamento?: (val: number) => void;
}

export const DadosFinanceiros: React.FC<DadosFinanceirosProps> = ({
  salarioBase, setSalarioBase,
  custoHoraNormal, setCustoHoraNormal,
  valorHoraExtra, setValorHoraExtra,
  limiteHorasDiario, setLimiteHorasDiario,
  diaPagamento = 5, setDiaPagamento,
  diaFechamento = 31, setDiaFechamento
}) => {
  const [tipoRemuneracao, setTipoRemuneracao] = useState<TipoRemuneracao>(() => {
    return salarioBase > 0 ? 'MENSALISTA' : 'HORISTA';
  });
  const [valorDiaria, setValorDiaria] = useState<number>(0);

  useEffect(() => {
    if (tipoRemuneracao === 'MENSALISTA') {
      const v = Number(salarioBase) || 0;
      setCustoHoraNormal(v > 0 ? Number((v / 220).toFixed(2)) : 0);
    } else if (tipoRemuneracao === 'DIARISTA' && valorDiaria > 0) {
      setCustoHoraNormal(Number((valorDiaria / 8).toFixed(2)));
    }
  }, [tipoRemuneracao, salarioBase, valorDiaria, setCustoHoraNormal]);

  const handleTipoChange = (tipo: TipoRemuneracao) => {
    setTipoRemuneracao(tipo);
    if (tipo === 'HORISTA' || tipo === 'DIARISTA') setSalarioBase(0);
    if (tipo === 'HORISTA' || tipo === 'MENSALISTA') setValorDiaria(0);
  };

  return (
    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-left">
      <TipoRemuneracaoButtons tipo={tipoRemuneracao} onChange={handleTipoChange} />

      <div className="grid grid-cols-2 gap-3 pt-1">
        {tipoRemuneracao === 'HORISTA' && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Valor da Hora do Operador (R$/h) *</label>
            <input
              type="number" step="0.01" min="0" required value={custoHoraNormal || ''}
              onChange={(e) => setCustoHoraNormal(parseFloat(e.target.value) || 0)} placeholder="Ex: 40,00"
              className="w-full px-2.5 py-2 bg-white border-2 border-emerald-500 rounded-lg font-mono font-bold text-gray-900 text-sm"
            />
          </div>
        )}

        {tipoRemuneracao === 'DIARISTA' && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Valor da Diária (R$) *</label>
            <input
              type="number" step="0.01" min="0" required value={valorDiaria || ''}
              onChange={(e) => setValorDiaria(parseFloat(e.target.value) || 0)} placeholder="0,00"
              className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 text-sm"
            />
          </div>
        )}

        {tipoRemuneracao === 'MENSALISTA' && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Salário Base Mensal (R$) *</label>
            <input
              type="number" step="0.01" min="0" required value={salarioBase || ''}
              onChange={(e) => setSalarioBase(parseFloat(e.target.value) || 0)} placeholder="0,00"
              className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 text-sm"
            />
          </div>
        )}

        {tipoRemuneracao !== 'HORISTA' && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Custo Hora Normal (Auto)</label>
            <input
              type="number" readOnly value={custoHoraNormal || ''}
              className="w-full px-2.5 py-2 bg-gray-100 border border-gray-200 rounded-lg font-mono text-gray-600 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Dia Pagamento (1 a 5) *</label>
          <input
            type="number" min="1" max="28" value={diaPagamento}
            onChange={(e) => setDiaPagamento?.(parseInt(e.target.value, 10) || 5)}
            className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 text-sm"
          />
          <span className="text-[10px] text-gray-400 block mt-0.5">Pagamento até dia 5 do mês seguinte</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Dia Fechamento Mês *</label>
          <input
            type="number" min="20" max="31" value={diaFechamento}
            onChange={(e) => setDiaFechamento?.(parseInt(e.target.value, 10) || 31)}
            className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 text-sm"
          />
          <span className="text-[10px] text-gray-400 block mt-0.5">Fechamento mensal (dia 30 ou 31)</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Hora Extra (R$/h)</label>
          <input
            type="number" step="0.01" min="0" placeholder="0,00" value={valorHoraExtra || ''}
            onChange={(e) => setValorHoraExtra(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Limite Diário (Horas)</label>
          <input
            type="number" step="0.5" value={limiteHorasDiario}
            onChange={(e) => setLimiteHorasDiario(parseFloat(e.target.value) || 8)}
            className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg font-mono text-gray-900 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
