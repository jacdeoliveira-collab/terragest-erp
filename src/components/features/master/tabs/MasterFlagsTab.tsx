import React from 'react';
import { Flag, ShieldAlert } from 'lucide-react';
import type { SystemFlag } from '../types/master.types';

interface MasterFlagsTabProps {
  flags: SystemFlag[];
  onToggleFlag: (id: string) => void;
}

export const MasterFlagsTab: React.FC<MasterFlagsTabProps> = ({ flags, onToggleFlag }) => {
  return (
    <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4 text-left">
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Flags de Sistema Globais</span>
        </h3>
        <p className="text-[11px] text-gray-400">
          Políticas técnicas e de segurança que se aplicam transversalmente a todos os tenants e operadores do ERP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 flex items-center justify-between gap-4 hover:border-[#30363d] transition-colors"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">{flag.nome}</span>
              <p className="text-[11px] text-gray-400">{flag.descricao}</p>
            </div>

            <button
              onClick={() => onToggleFlag(flag.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flag.ativado ? 'bg-emerald-500' : 'bg-gray-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  flag.ativado ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0d12] border border-[#21262d] rounded-lg p-3 text-xs text-gray-400 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          As alterações em Flags Globais são propagadas instantaneamente em cache para todas as instâncias ativas do TerraGest.
        </span>
      </div>
    </div>
  );
};
