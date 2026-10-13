import React from 'react';
import { Clock, DollarSign, Wallet, CheckCircle } from 'lucide-react';
import type { OperadorHistoricoData } from '../../../../hooks/useOperadorHistorico';

interface Props {
  data: OperadorHistoricoData;
}

export const OperadorHistoricoCards: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
        <span className="text-[10px] text-blue-700 font-bold uppercase flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-600" /> Horas Trabalhadas
        </span>
        <div className="text-base font-black text-blue-900 font-mono mt-0.5">
          {data.totalHoras.toFixed(1)} h
        </div>
        <span className="text-[10px] text-blue-600">{data.qtdServicos} serviço(s)</span>
      </div>

      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
        <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-emerald-600" /> Total Ganhos
        </span>
        <div className="text-base font-black text-emerald-900 font-mono mt-0.5">
          R$ {data.totalGanho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-emerald-600">Diárias / Comissões</span>
      </div>

      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
        <span className="text-[10px] text-purple-700 font-bold uppercase flex items-center gap-1">
          <Wallet className="w-3 h-3 text-purple-600" /> Vales / Adiantamentos
        </span>
        <div className="text-base font-black text-purple-900 font-mono mt-0.5">
          R$ {data.totalVales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-purple-600">Total já adiantado</span>
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
        <span className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-amber-600" /> Saldo a Receber
        </span>
        <div className="text-base font-black text-amber-900 font-mono mt-0.5">
          R$ {data.saldoPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-amber-600">Pendente de acerto</span>
      </div>
    </div>
  );
};
