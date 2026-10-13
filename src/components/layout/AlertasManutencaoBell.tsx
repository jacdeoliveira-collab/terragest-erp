import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { useAlertasManutencao, type AlertaManutencao } from '../../hooks/useAlertasManutencao';

const estilos = {
  VENCIDA: { cor: 'text-rose-600 bg-rose-50 border-rose-200', Icon: AlertTriangle },
  PROXIMA: { cor: 'text-amber-600 bg-amber-50 border-amber-200', Icon: Clock },
  CORRETIVA: { cor: 'text-orange-600 bg-orange-50 border-orange-200', Icon: Wrench }
} as const;

function textoAlerta(a: AlertaManutencao): string {
  const fmt = (n: number) => (a.unidade === 'km' ? Math.round(n).toLocaleString('pt-BR') : n.toFixed(1));
  if (a.nivel === 'CORRETIVA') return 'Checklist reprovado - OS corretiva aberta';
  if (a.nivel === 'VENCIDA') return `Revisão vencida há ${fmt(a.diferenca)} ${a.unidade}`;
  return `Revisão em ${fmt(a.diferenca)} ${a.unidade} (alvo ${fmt(a.leituraAlvo)} ${a.unidade})`;
}

export const AlertasManutencaoBell: React.FC = () => {
  const { alertas } = useAlertasManutencao();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const urgentes = alertas.filter((a) => a.nivel !== 'PROXIMA').length;

  useEffect(() => {
    const fechar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        title="Alertas de revisão"
        aria-label="Alertas de revisão"
        className="relative p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {alertas.length > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${urgentes > 0 ? 'bg-rose-500' : 'bg-amber-500'}`}>
            {alertas.length}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 text-xs font-bold text-gray-800">Alertas de Manutenção</div>
          <div className="max-h-80 overflow-y-auto">
            {alertas.length === 0 ? (
              <p className="px-3 py-4 text-xs text-gray-500 text-center">Nenhuma revisão vencida ou próxima do vencimento.</p>
            ) : (
              alertas.map((a) => {
                const { cor, Icon } = estilos[a.nivel];
                return (
                  <button
                    key={a.id}
                    onClick={() => { setAberto(false); navigate('/manutencao'); }}
                    className="w-full text-left px-3 py-2 flex gap-2 hover:bg-gray-50 border-b border-gray-50 cursor-pointer"
                  >
                    <span className={`p-1.5 rounded-lg border h-fit ${cor}`}><Icon className="w-3.5 h-3.5" /></span>
                    <span className="text-xs">
                      <span className="font-semibold text-gray-800 block">{a.maquina} - {a.servico}</span>
                      <span className="text-gray-500">{textoAlerta(a)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
