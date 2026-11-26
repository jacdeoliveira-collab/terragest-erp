import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Filter, HardHat, Truck, Users, UserCheck } from 'lucide-react';
import type { GestaoBIResult, GestaoBIFiltros } from '../../../types/gestaoBI.types';

interface Props {
  resultado: GestaoBIResult;
  onCruzar: <K extends keyof GestaoBIFiltros>(key: K, val: GestaoBIFiltros[K]) => void;
}

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const GestaoCruzamentoTabs: React.FC<Props> = ({ resultado, onCruzar }) => {
  const navigate = useNavigate();
  const [aba, setAba] = useState<'maquinas' | 'clientes' | 'operadores' | 'centros'>('maquinas');

  const tabs = [
    { id: 'maquinas' as const, label: `Máquinas (${resultado.porMaquina.length})`, icon: Truck },
    { id: 'clientes' as const, label: `Clientes (${resultado.porCliente.length})`, icon: Users },
    { id: 'operadores' as const, label: `Operadores (${resultado.porOperador.length})`, icon: UserCheck },
    { id: 'centros' as const, label: `Centros (${resultado.porCentroCusto.length})`, icon: HardHat }
  ];

  return (
    <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5 border-b border-slate-700/60 pb-2.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} type="button" onClick={() => setAba(t.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${aba === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'}`}>
              <Icon className="w-3.5 h-3.5" /><span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {aba === 'maquinas' && (
        <div className="space-y-2">
          {resultado.porMaquina.length === 0 ? <p className="text-xs text-slate-400 py-4 text-center">Nenhum dado de máquina neste recorte.</p> : resultado.porMaquina.map((m) => (
            <div key={m.id} className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <button type="button" onClick={() => navigate('/frota')} className="text-left group cursor-pointer">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 inline-flex items-center gap-1">{m.nome} <ArrowUpRight className="w-3 h-3 text-slate-500" /></div>
                <div className="text-[10px] text-slate-400 font-mono">{m.horas.toFixed(1)}h • Diesel: {m.litrosHora.toFixed(1)} L/h ({fmt(m.dieselValor)}) • Op.: {fmt(m.operador)} • Manut.: {fmt(m.manutencao)}</div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">{fmt(m.receita)}</div>
                  <div className={`text-[10px] font-mono font-bold ${m.lucro >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>Lucro: {fmt(m.lucro)} ({m.margemPercent.toFixed(0)}%)</div>
                </div>
                {m.id !== 'SEM_MAQ' && (
                  <button type="button" onClick={() => onCruzar('maquinaId', m.id)} title="Cruzar painel por esta máquina" className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white cursor-pointer"><Filter className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'clientes' && (
        <div className="space-y-2">
          {resultado.porCliente.length === 0 ? <p className="text-xs text-slate-400 py-4 text-center">Nenhum cliente neste recorte.</p> : resultado.porCliente.slice(0, 12).map((c) => (
            <div key={c.nome} className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => navigate('/clientes')} className="text-left group cursor-pointer min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 inline-flex items-center gap-1 truncate">{c.nome} <ArrowUpRight className="w-3 h-3 text-slate-500" /></div>
                <div className="text-[10px] text-slate-400 font-mono">{c.qtdServicos} serv. • {c.horas.toFixed(1)}h • Recebido: {fmt(c.recebido)}</div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">{fmt(c.faturado)}</div>
                  {c.emAberto > 0 && <button type="button" onClick={() => navigate('/financeiro?aba=receber')} className="text-[10px] font-mono font-bold text-rose-400 hover:underline cursor-pointer">Aberto: {fmt(c.emAberto)}</button>}
                </div>
                <button type="button" onClick={() => onCruzar('clienteNome', c.nome)} title="Cruzar painel por este cliente" className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white cursor-pointer"><Filter className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'operadores' && (
        <div className="space-y-2">
          {resultado.porOperador.length === 0 ? <p className="text-xs text-slate-400 py-4 text-center">Nenhum operador neste recorte.</p> : resultado.porOperador.map((o) => (
            <div key={o.nome} className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => navigate('/rh')} className="text-left group cursor-pointer min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 inline-flex items-center gap-1 truncate">{o.nome} <ArrowUpRight className="w-3 h-3 text-slate-500" /></div>
                <div className="text-[10px] text-slate-400 font-mono">{o.horas.toFixed(1)}h • Gerou: {fmt(o.receitaGerada)} • Vales: {fmt(o.valesPagos)}</div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-indigo-300">Ganhos: {fmt(o.ganhos)}</div>
                  <div className={`text-[10px] font-mono font-bold ${o.saldoAPagar > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>Saldo: {fmt(o.saldoAPagar)}</div>
                </div>
                <button type="button" onClick={() => onCruzar('operadorNome', o.nome)} title="Cruzar painel por este operador" className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white cursor-pointer"><Filter className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'centros' && (
        <div className="space-y-2">
          {resultado.porCentroCusto.length === 0 ? <p className="text-xs text-slate-400 py-4 text-center">Nenhum centro de custo vinculado neste recorte.</p> : resultado.porCentroCusto.map((cc) => (
            <div key={cc.id} className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => navigate('/centros-custo')} className="text-left group cursor-pointer min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 inline-flex items-center gap-1 truncate">{cc.nome} <ArrowUpRight className="w-3 h-3 text-slate-500" /></div>
                <div className="text-[10px] text-slate-400 font-mono">Custos diretos: {fmt(cc.custo)}</div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">{fmt(cc.receita)}</div>
                  <div className={`text-[10px] font-mono font-bold ${cc.lucro >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>Lucro: {fmt(cc.lucro)} ({cc.margemPercent.toFixed(0)}%)</div>
                </div>
                <button type="button" onClick={() => onCruzar('centroCustoId', cc.id)} title="Cruzar painel por este centro de custo" className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white cursor-pointer"><Filter className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
