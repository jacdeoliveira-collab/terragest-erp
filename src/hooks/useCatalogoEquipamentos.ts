import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CatalogoItem {
  id?: string;
  categoria: string;
  marca: string;
  modelo: string;
}

const CATALOGO_FALLBACK: CatalogoItem[] = [
  { categoria: 'LINHA_AMARELA', marca: 'Caterpillar', modelo: '320D' },
  { categoria: 'LINHA_AMARELA', marca: 'Caterpillar', modelo: 'D6T' },
  { categoria: 'LINHA_AMARELA', marca: 'Caterpillar', modelo: '924K' },
  { categoria: 'LINHA_AMARELA', marca: 'Komatsu', modelo: 'PC200-8' },
  { categoria: 'LINHA_AMARELA', marca: 'Komatsu', modelo: 'D61EX' },
  { categoria: 'LINHA_AMARELA', marca: 'Volvo', modelo: 'EC210D' },
  { categoria: 'LINHA_AMARELA', marca: 'Volvo', modelo: 'L90H' },
  { categoria: 'LINHA_AMARELA', marca: 'Case', modelo: '580N' },
  { categoria: 'LINHA_AMARELA', marca: 'JCB', modelo: '3CX' },
  { categoria: 'CAMINHAO_TRANSPORTE', marca: 'Mercedes-Benz', modelo: 'Atego 2730' },
  { categoria: 'CAMINHAO_TRANSPORTE', marca: 'Volkswagen', modelo: 'Constellation 26.280' },
  { categoria: 'CAMINHAO_TRANSPORTE', marca: 'Volvo', modelo: 'FMX 460' },
  { categoria: 'CAMINHAO_TRANSPORTE', marca: 'Scania', modelo: 'G440' },
  { categoria: 'EQUIPAMENTO_APOIO', marca: 'Atlas Copco', modelo: 'QAS 70' },
  { categoria: 'EQUIPAMENTO_APOIO', marca: 'Stemac', modelo: '150 kVA' },
  { categoria: 'VEICULO_LEVE', marca: 'Toyota', modelo: 'Hilux 4x4' },
  { categoria: 'VEICULO_LEVE', marca: 'Mitsubishi', modelo: 'L200 Triton' }
];

export function useCatalogoEquipamentos() {
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>(CATALOGO_FALLBACK);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalogo() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('catalogo_equipamentos')
          .select('categoria, marca, modelo')
          .order('marca', { ascending: true })
          .order('modelo', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data && data.length > 0) {
          setCatalogo(data as CatalogoItem[]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Falha ao buscar catálogo';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCatalogo();
  }, []);

  return {
    catalogo,
    isLoading,
    error
  };
}
