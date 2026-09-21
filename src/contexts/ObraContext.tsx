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

export const ObraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { obras, loading, error, recarregarObras } = useObras();
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null);

  // Sincroniza a primeira obra ativa ou mantém a selecionada se ainda existir
  useEffect(() => {
    if (obras.length > 0) {
      setObraSelecionada((prev) => {
        if (prev && obras.some((o) => o.id === prev.id)) {
          return obras.find((o) => o.id === prev.id) || prev;
        }
        return obras[0];
      });
    } else {
      setObraSelecionada(null);
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
