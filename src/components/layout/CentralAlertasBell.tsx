import React, { useEffect, useRef, useState } from 'react';
import { Bell, ShieldCheck, X } from 'lucide-react';
import { useCentralAlertas } from '../../hooks/useCentralAlertas';
import { AlertaRowItem } from './AlertaRowItem';

type FiltroTab = 'TODOS' | 'FINANCEIRO' | 'MANUTENCAO' | 'OPERACIONAL';

export const CentralAlertasBell: React.FC = () => {
  const { alertas, total, criticos } = useCentralAlertas();
  const [aberto, setAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<FiltroTab>('TODOS');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fechar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);

  const alertasFiltrados = alertas.filter((a) => {
    if (abaAtiva === 'TODOS') return true;
    if (abaAtiva === 'FINANCEIRO') return a.modulo === 'FINANCEIRO_PAGAR' || a.modulo === 'FINANCEIRO_RECEBER';
    if (abaAtiva === 'MANUTENCAO') return a.modulo === 'MANUTENCAO';
    if (abaAtiva === 'OPERACIONAL') return a.modulo === 'RH' || a.modulo === 'CHECKLIST';
    return true;
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        title="Central de Alertas de Todos os Módulos"
        aria-label="Central de Alertas"
        className="relative p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {total > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-xs ${
              criticos > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
            }`}
          >
            {total}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/30 z-40 sm:hidden"
            onClick={() => setAberto(false)}
          />
          <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Cabeçalho */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-xs font-bold tracking-wide truncate">Central de Notificações</h3>
                <p className="text-[10px] text-slate-400 truncate">Alertas integrados de todos os módulos</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {total > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/80 rounded-full font-bold whitespace-nowrap">
                    {total} {total === 1 ? 'pendência' : 'pendências'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg sm:hidden cursor-pointer"
                  aria-label="Fechar notificações"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Abas de Filtro */}
            <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 gap-1 text-[11px] font-semibold">
              {(
                [
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'FINANCEIRO', label: 'Financeiro' },
                  { id: 'MANUTENCAO', label: 'Manutenção' },
                  { id: 'OPERACIONAL', label: 'RH & Ops' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAbaAtiva(tab.id)}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                    abaAtiva === tab.id
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lista de Alertas */}
            <div className="max-h-[68vh] sm:max-h-88 overflow-y-auto divide-y divide-gray-50">
              {alertasFiltrados.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">Tudo em dia!</p>
                  <p className="text-[11px] text-gray-500">
                    Nenhum alerta pendente para a categoria selecionada.
                  </p>
                </div>
              ) : (
                alertasFiltrados.map((a) => (
                  <AlertaRowItem key={a.id} alerta={a} onSelect={() => setAberto(false)} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
