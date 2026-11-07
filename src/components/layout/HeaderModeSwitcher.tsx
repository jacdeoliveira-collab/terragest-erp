import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, HardHat } from 'lucide-react';
import { useWorkspaceMode, type WorkspaceMode } from '../../contexts/WorkspaceModeContext';

export const HeaderModeSwitcher: React.FC = () => {
  const { modoAtivo, setModoAtivo } = useWorkspaceMode();
  const navigate = useNavigate();

  const handleTrocar = (modo: WorkspaceMode) => {
    setModoAtivo(modo);
    if (modo === 'HORIMETRO') navigate('/comercial');
    else navigate('/');
  };

  return (
    <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
      <button
        type="button"
        onClick={() => handleTrocar('HORIMETRO')}
        title="Modo Foco: Serviço por Horímetro, BDE, Sinaleiro e Checklists"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
          modoAtivo === 'HORIMETRO'
            ? 'bg-amber-500 text-slate-950 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <Gauge className="w-3.5 h-3.5" />
        <span>Horímetro</span>
      </button>

      <button
        type="button"
        onClick={() => handleTrocar('OBRAS')}
        title="Modo Obras & Gestão Completa: Todos os módulos da empresa"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
          modoAtivo === 'OBRAS'
            ? 'bg-emerald-600 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <HardHat className="w-3.5 h-3.5" />
        <span>Obras</span>
      </button>
    </div>
  );
};
