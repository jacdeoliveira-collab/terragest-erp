import React from 'react';
import { RefreshCw, Database } from 'lucide-react';
import type { TableInventoryItem } from '../types/master.types';

interface TableInventoryGridProps {
  inventario: TableInventoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const TableInventoryGrid: React.FC<TableInventoryGridProps> = ({
  inventario,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inventário de Tabelas do Banco</span>
          </h3>
          <p className="text-[11px] text-gray-400">Contagem de registros e integridade relacional em tempo real</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2128] hover:bg-[#2d333b] text-gray-300 hover:text-white rounded-md text-xs font-medium border border-[#30363d] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {inventario.map((item) => (
          <div
            key={item.id}
            className="bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] rounded-lg p-3 flex items-center justify-between transition-colors"
          >
            <div className="space-y-0.5 truncate pr-2">
              <p className="text-xs font-semibold text-gray-200 truncate">{item.nome}</p>
              <p className="text-[10px] text-gray-400 font-mono truncate">{item.tabela}</p>
            </div>
            <div className="text-right shrink-0">
              {item.status === 'erro' ? (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  Erro
                </span>
              ) : (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.contagem !== null ? `${item.contagem} linhas` : '...'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
