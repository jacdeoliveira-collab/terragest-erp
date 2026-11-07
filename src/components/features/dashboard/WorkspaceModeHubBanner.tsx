import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, HardHat, CheckCircle2, ArrowRight } from 'lucide-react';
import { useWorkspaceMode, type WorkspaceMode } from '../../../contexts/WorkspaceModeContext';

export const WorkspaceModeHubBanner: React.FC = () => {
  const { modoAtivo, setModoAtivo } = useWorkspaceMode();
  const navigate = useNavigate();

  const selecionarModo = (modo: WorkspaceMode, rota?: string) => {
    setModoAtivo(modo);
    if (rota) navigate(rota);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-lg text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
            Central de Operações TerraGest ERP
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Em qual modo de operação você deseja trabalhar agora?
          </h2>
        </div>
        <span className="text-[11px] text-slate-300 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full self-start sm:self-auto">
          Mesmo Banco de Dados • Sem perda de funções
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* MODO 1: SERVIÇOS POR HORÍMETRO */}
        <button
          type="button"
          onClick={() => selecionarModo('HORIMETRO', '/comercial')}
          className={`group text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            modoAtivo === 'HORIMETRO'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Gauge className="w-5 h-5" />
              </div>
              {modoAtivo === 'HORIMETRO' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> ATIVO
                </span>
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
            <h3 className="font-bold text-sm text-white mb-1">1. Serviço por Horímetro (Foco Direto)</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Menu enxuto e direto para locação de máquinas, medições de horímetro, combustível, diárias, BDE, Sinaleiro e Checklists.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
            <span>Abrir Serviço por Horímetro</span>
            <span>→</span>
          </div>
        </button>

        {/* MODO 2: GRANDES OBRAS & GESTÃO */}
        <button
          type="button"
          onClick={() => selecionarModo('OBRAS')}
          className={`group text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            modoAtivo === 'OBRAS'
              ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/30'
              : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <HardHat className="w-5 h-5" />
              </div>
              {modoAtivo === 'OBRAS' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> ATIVO
                </span>
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
            <h3 className="font-bold text-sm text-white mb-1">2. Obras & Gestão Completa</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Exibe Dashboard Executivo, Centros de Custo & Obras, Frota, Almoxarifado, Financeiro, RH, Abastecimento, Manutenção e Minha Empresa.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-emerald-300 font-semibold">
            <span>Operar no Modo Obras</span>
            <span>✓</span>
          </div>
        </button>
      </div>
    </div>
  );
};
