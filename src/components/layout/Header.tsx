import React from 'react';
import { User, HardHat, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useObraContext } from '../../contexts/ObraContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { obras, obraSelecionada, setObraSelecionada, loading } = useObraContext();

  const usuarioNome = user?.email ? user.email.split('@')[0] : 'Operador';
  const temObras = obras.length > 0;

  const handleChangeObra = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selecionada = obras.find((o) => o.id === id) || null;
    setObraSelecionada(selecionada);
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
          <HardHat className="w-4 h-4" />
        </div>

        <div className="relative">
          <select
            disabled={!temObras || loading}
            value={obraSelecionada?.id || ''}
            onChange={handleChangeObra}
            className="appearance-none pl-3 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100/70 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading ? (
              <option value="">Carregando obras...</option>
            ) : !temObras ? (
              <option value="">Nenhuma obra cadastrada</option>
            ) : (
              obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-medium text-gray-800 block capitalize">{usuarioNome}</span>
            <span className="text-[10px] text-gray-400">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Encerrar Sessão"
          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
