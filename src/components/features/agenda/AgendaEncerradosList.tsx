import React from 'react';
import { CheckCircle2, Clock, MapPin, RotateCcw, Trash2, User } from 'lucide-react';
import type { AgendaOperacionalItem } from '../../../types/agenda.types';

interface Props {
  itens: AgendaOperacionalItem[];
  onReabrir: (id: string) => void;
  onExcluir: (id: string) => void;
}

export const AgendaEncerradosList: React.FC<Props> = ({ itens, onReabrir, onExcluir }) => {
  if (itens.length === 0) {
    return (
      <div className="p-10 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-500">
        Nenhum agendamento encerrado até o momento.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 text-left text-xs">
      {itens.map((item) => (
        <div key={item.id} className="p-3.5 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">{item.cliente_nome}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> {item.status === 'CANCELADO' ? 'CANCELADO' : 'ENCERRADO'}
              </span>
              {item.maquina_nome && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">{item.maquina_nome}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-600" /> {item.horas_estimadas}h</span>
              {item.operador_nome && <span className="inline-flex items-center gap-1"><User className="w-3 h-3 text-blue-600" /> {item.operador_nome}</span>}
              {item.endereco_servico && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {item.endereco_servico}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => onReabrir(item.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer">
              <RotateCcw className="w-3 h-3" /><span>Reabrir na Fila</span>
            </button>
            <button type="button" onClick={() => onExcluir(item.id)} title="Excluir" className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
