import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, HardHat } from 'lucide-react';
import { useWorkspaceMode, type WorkspaceMode } from '../../contexts/WorkspaceModeContext';

interface Props {
  onSelect?: () => void;
}

export const SidebarModeSelector: React.FC<Props> = ({ onSelect }) => {
  const { modoAtivo, setModoAtivo, infoModo } = useWorkspaceMode();
  const navigate = useNavigate();

  const handleTrocar = (modo: WorkspaceMode) => {
    setModoAtivo(modo);
    if (modo === 'HORIMETRO') navigate('/comercial');
    else navigate('/');
    if (onSelect) onSelect();
  };

  return (
    <div className="px-3.5 pt-3 pb-2 border-b border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Modo de Operação
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${infoModo.corBadge}`}>
          {modoAtivo === 'HORIMETRO' ? 'Horímetro' : 'Obras'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => handleTrocar('HORIMETRO')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            modoAtivo === 'HORIMETRO'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 shrink-0" />
          <span>Horímetro</span>
        </button>

        <button
          type="button"
          onClick={() => handleTrocar('OBRAS')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            modoAtivo === 'OBRAS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HardHat className="w-3.5 h-3.5 shrink-0" />
          <span>Obras</span>
        </button>
      </div>
    </div>
  );
};
