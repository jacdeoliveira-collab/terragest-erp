import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarClock, HardHat, Truck, Wrench } from 'lucide-react';
import type { GestaoBIRadar } from '../../../types/gestaoBI.types';

interface Props { radar: GestaoBIRadar; }

export const GestaoRadarOperacional: React.FC<Props> = ({ radar }) => {
  const navigate = useNavigate();

  const items = [
    {
      label: 'Fila da Agenda',
      valor: `${radar.agendaNaFila} na fila`,
      sub: `${radar.agendaHorasPrevistas.toFixed(0)}h previstas`,
      to: '/agenda',
      icon: CalendarClock,
      cor: 'text-cyan-400'
    },
    {
      label: 'Manut. Preventivas',
      valor: radar.manutencoesVencidas > 0 ? `${radar.manutencoesVencidas} vencida(s)` : 'Em dia',
      sub: `${radar.manutencoesProximas} próxima(s) (≤50h)`,
      to: '/manutencao',
      icon: Wrench,
      cor: radar.manutencoesVencidas > 0 ? 'text-rose-400' : 'text-emerald-400'
    },
    {
      label: 'Frota Ativa',
      valor: `${radar.frotasAtivas}/${radar.totalFrota}`,
      sub: 'Abrir gestão de maquinário',
      to: '/frota',
      icon: Truck,
      cor: 'text-indigo-400'
    },
    {
      label: 'Centros de Custo',
      valor: String(radar.centrosAtivos),
      sub: 'Ativos no período',
      to: '/centros-custo',
      icon: HardHat,
      cor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.label}
            type="button"
            onClick={() => navigate(it.to)}
            className="group rounded-2xl bg-[#232130] hover:bg-[#2a273a] border border-slate-700/60 hover:border-indigo-500/50 p-3.5 flex items-center justify-between gap-2 text-left transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`w-5 h-5 shrink-0 ${it.cor}`} />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 truncate">{it.label}</p>
                <p className={`text-sm font-bold truncate ${it.cor}`}>{it.valor}</p>
                <p className="text-[10px] text-slate-400 truncate">{it.sub}</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
          </button>
        );
      })}
    </div>
  );
};
