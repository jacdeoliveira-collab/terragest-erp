import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Obra } from '../types/obras.types';
import { useObras } from '../hooks/useObras';

interface ObraContextType {
  obraSelecionada: Obra | null;
  setObraSelecionada: (obra: Obra | null) => void;
  obras: Obra[];
  loading: boolean;
  error: string | null;
  recarregarObras: () => Promise<void>;
}

const ObraContext = createContext<ObraContextType | undefined>(undefined);

const STORAGE_KEY = 'terragest_obra_selecionada_id';

export const ObraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { obras, loading, error, recarregarObras } = useObras();
  const [obraSelecionada, setObraSelecionadaState] = useState<Obra | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId === 'TODAS' || savedId === '' || !savedId) return null;
    } catch {}
    return null;
  });

  const setObraSelecionada = (obra: Obra | null) => {
    setObraSelecionadaState(obra);
    try {
      localStorage.setItem(STORAGE_KEY, obra ? obra.id : 'TODAS');
    } catch {}
  };

  useEffect(() => {
    if (obras.length > 0) {
      try {
        const savedId = localStorage.getItem(STORAGE_KEY);
        if (savedId === 'TODAS' || savedId === '') {
          setObraSelecionadaState(null);
          return;
        }
        if (savedId) {
          const found = obras.find((o) => o.id === savedId);
          if (found) {
            setObraSelecionadaState(found);
            return;
          }
        }
      } catch {}
      setObraSelecionadaState((prev) => {
        if (prev && obras.some((o) => o.id === prev.id)) {
          return obras.find((o) => o.id === prev.id) || prev;
        }
        return prev;
      });
    } else {
      setObraSelecionadaState(null);
    }
  }, [obras]);

  return (
    <ObraContext.Provider
      value={{
        obraSelecionada,
        setObraSelecionada,
        obras,
        loading,
        error,
        recarregarObras
      }}
    >
      {children}
    </ObraContext.Provider>
  );
};

export function useObraContext(): ObraContextType {
  const context = useContext(ObraContext);
  if (!context) {
    throw new Error('useObraContext deve ser utilizado dentro de um ObraProvider');
  }
  return context;
}

