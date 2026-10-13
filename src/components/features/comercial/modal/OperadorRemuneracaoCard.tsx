import React from 'react';
import { UserCheck, Calculator } from 'lucide-react';

interface Props {
  operadorNome: string;
  horasTrabalhadas: number;
  valorHoraOperador: number;
  despesaOperador: number;
  setDespesaOperador: (v: number) => void;
}

export const OperadorRemuneracaoCard: React.FC<Props> = ({
  operadorNome,
  horasTrabalhadas,
  valorHoraOperador,
  despesaOperador,
  setDespesaOperador
}) => {
  return (
    <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-sky-950 text-xs">
          <UserCheck className="w-4 h-4 text-sky-600" />
          <span>Operador Responsável: {operadorNome || 'Não selecionado'}</span>
        </div>
        <span className="font-mono text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
          {horasTrabalhadas.toFixed(1)} h executadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
            Valor Hora Cadastrado no RH (Fixo)
          </label>
          <div className="px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-mono font-bold text-sky-900">
            {valorHoraOperador > 0 ? `R$ ${valorHoraOperador.toFixed(2)}/h` : 'Não definido no RH (R$ 0,00)'}
          </div>
          <span className="text-[10px] text-gray-500">Puxado automaticamente da ficha do colaborador no RH</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5 flex items-center gap-1">
            <Calculator className="w-3 h-3 text-sky-600" />
            <span>Custo do Operador no Serviço (R$)</span>
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-gray-400 font-mono text-[11px]">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={despesaOperador || ''}
              onChange={(e) => setDespesaOperador(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <span className="text-[10px] text-gray-500">
            {valorHoraOperador > 0 && horasTrabalhadas > 0
              ? `Cálculo: ${horasTrabalhadas.toFixed(1)} h × R$ ${valorHoraOperador.toFixed(2)}/h = R$ ${(horasTrabalhadas * valorHoraOperador).toFixed(2)}`
              : 'Cálculo: Horas trabalhadas × Taxa horária cadastrada no RH'}
          </span>
        </div>
      </div>
    </div>
  );
};
