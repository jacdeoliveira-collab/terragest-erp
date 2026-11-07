import React from 'react';
import { HandCoins, UserCheck, Calendar, CalendarClock } from 'lucide-react';

interface EmprestimoFieldsBoxProps {
  credorNome: string;
  setCredorNome: (val: string) => void;
  dataEmprestimo: string;
  setDataEmprestimo: (val: string) => void;
  dataPagamentoPrevista: string;
  setDataPagamentoPrevista: (val: string) => void;
  compact?: boolean;
}

export const EmprestimoFieldsBox: React.FC<EmprestimoFieldsBoxProps> = ({
  credorNome,
  setCredorNome,
  dataEmprestimo,
  setDataEmprestimo,
  dataPagamentoPrevista,
  setDataPagamentoPrevista,
  compact = false,
}) => {
  return (
    <div className={`${compact ? 'p-2.5' : 'p-3.5'} bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-2.5 text-left animate-fade-in`}>
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-1.5">
        <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
          <HandCoins className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Controle de Empréstimo / Recurso de Terceiro</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
          Gera Contas a Pagar
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>De quem pegou o valor? *</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Sócio João, Amigo, Cartão, Banco..."
            value={credorNome}
            onChange={(e) => setCredorNome(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Data em que pegou *</span>
          </label>
          <input
            type="date"
            required
            value={dataEmprestimo}
            onChange={(e) => setDataEmprestimo(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center gap-1">
            <CalendarClock className="w-3.5 h-3.5 text-rose-600" />
            <span>Quando pagar (Vencimento) *</span>
          </label>
          <input
            type="date"
            required
            value={dataPagamentoPrevista}
            onChange={(e) => setDataPagamentoPrevista(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {!compact && (
        <p className="text-[10px] text-amber-800 leading-tight">
          O valor ficará registrado no <b>Financeiro &rarr; Empréstimos / Contas a Pagar</b> em nome de <b>{credorNome || 'quem emprestou'}</b> com vencimento na data combinada para devolução.
        </p>
      )}
    </div>
  );
};

