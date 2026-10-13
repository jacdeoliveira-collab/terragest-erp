import React from 'react';
import { DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { FuncionarioHistoricoData } from '../../../../types/funcionarioHistorico.types';

interface Props {
  data: FuncionarioHistoricoData;
  onSelectAba?: (tab: 'financeiro' | 'producao', filtro?: 'todos' | 'quitados' | 'pendentes') => void;
}

export const FuncionarioHistoricoCards: React.FC<Props> = ({ data, onSelectAba }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
      <button
        type="button"
        onClick={() => onSelectAba?.('financeiro', 'todos')}
        title="Clique para ver os demonstrativos financeiros deste operador"
        className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-xl transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Total Ganhos do Operador</span>
        </div>
        <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
          R$ {data.totalGanhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[10px] text-emerald-700/80 mt-0.5">
          {data.qtdServicos} serviços • Ver pagamentos
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelectAba?.('financeiro', 'quitados')}
        title="Clique para ver os pagamentos e vales já quitados"
        className="p-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-1.5 text-blue-800 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Total Já Pago / Vales</span>
        </div>
        <div className="text-xl font-bold font-mono text-blue-950 mt-1">
          R$ {data.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[10px] text-blue-700/80 mt-0.5">
          {data.qtdQuitados} quitados • Filtrar
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelectAba?.('financeiro', 'pendentes')}
        title="Clique para ver os saldos pendentes de pagamento"
        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
          data.totalSaldoAberto > 0
            ? 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/80 text-amber-900'
            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
        }`}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <AlertCircle className={`w-3.5 h-3.5 ${data.totalSaldoAberto > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
          <span>Saldo a Pagar</span>
        </div>
        <div className={`text-xl font-bold font-mono mt-1 ${data.totalSaldoAberto > 0 ? 'text-amber-950' : 'text-gray-900'}`}>
          R$ {data.totalSaldoAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className={`text-[10px] mt-0.5 ${data.totalSaldoAberto > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
          {data.totalSaldoAberto > 0 ? 'Pagamento pendente • Filtrar' : 'Tudo quitado'}
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelectAba?.('producao')}
        title="Clique para ir à aba de produção em horas e máquinas deste operador"
        className="p-3 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/80 rounded-xl transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-1.5 text-indigo-800 text-[11px] font-semibold">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Horas Totais Produzidas</span>
        </div>
        <div className="text-xl font-bold font-mono text-indigo-950 mt-1">
          {data.totalHorasGeral.toFixed(1)}h
        </div>
        <p className="text-[10px] text-indigo-700/80 mt-0.5">
          {data.qtdServicos} locações • {data.qtdBdes} BDEs • Ver produção
        </p>
      </button>
    </div>
  );
};
