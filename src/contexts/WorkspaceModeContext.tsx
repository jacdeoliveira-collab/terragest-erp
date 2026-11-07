import React, { createContext, useContext, useState } from 'react';

export type WorkspaceMode = 'HORIMETRO' | 'OBRAS';

export interface WorkspaceModeInfo {
  id: WorkspaceMode;
  titulo: string;
  subtitulo: string;
  corBadge: string;
  rotaPrincipal: string;
}

export const MODOS_DISPONIVEIS: Record<WorkspaceMode, WorkspaceModeInfo> = {
  HORIMETRO: {
    id: 'HORIMETRO',
    titulo: 'Serviços por Horímetro',
    subtitulo: 'Locação Direta, Medição de Horas, Boletins, Sinaleiro e Checklists',
    corBadge: 'bg-amber-500 text-slate-950',
    rotaPrincipal: '/comercial'
  },
  OBRAS: {
    id: 'OBRAS',
    titulo: 'Grandes Obras & Gestão',
    subtitulo: 'Dashboard, Obras, Frota, Almoxarifado, Financeiro, RH e Empresa',
    corBadge: 'bg-emerald-500 text-white',
    rotaPrincipal: '/'
  }
};

interface WorkspaceModeContextType {
  modoAtivo: WorkspaceMode;
  setModoAtivo: (modo: WorkspaceMode) => void;
  infoModo: WorkspaceModeInfo;
}

const STORAGE_KEY = 'terragest_workspace_mode';

const WorkspaceModeContext = createContext<WorkspaceModeContextType | undefined>(undefined);

export const WorkspaceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modoAtivo, setModoState] = useState<WorkspaceMode>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem(STORAGE_KEY) as WorkspaceMode | null;
      if (salvo === 'HORIMETRO' || salvo === 'OBRAS') return salvo;
    }
    return 'HORIMETRO';
  });

  const setModoAtivo = (novoModo: WorkspaceMode) => {
    setModoState(novoModo);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, novoModo);
    }
  };

  return (
    <WorkspaceModeContext.Provider
      value={{
        modoAtivo,
        setModoAtivo,
        infoModo: MODOS_DISPONIVEIS[modoAtivo]
      }}
    >
      {children}
    </WorkspaceModeContext.Provider>
  );
};

export function useWorkspaceMode() {
  const ctx = useContext(WorkspaceModeContext);
  if (!ctx) {
    throw new Error('useWorkspaceMode deve ser usado dentro de WorkspaceModeProvider');
  }
  return ctx;
}
