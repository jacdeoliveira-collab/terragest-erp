import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { HealthCheckData, TableInventoryItem } from '../types/master.types';

const TABELAS_MONITORADAS = [
  { id: '1', nome: 'Tenants / Construtoras', tabela: 'tenants' },
  { id: '2', nome: 'Gestão de Frotas & Maquinário', tabela: 'equipment' },
  { id: '3', nome: 'Centros de Custo & Obras', tabela: 'obras' },
  { id: '4', nome: 'Boletins Diários de Equipamento (BDE)', tabela: 'daily_bulletins' },
  { id: '5', nome: 'Funcionários & Operadores', tabela: 'rh_funcionarios' },
  { id: '6', nome: 'Abastecimentos & Diesel', tabela: 'abastecimentos' },
  { id: '7', nome: 'Serviços & Horímetro', tabela: 'servicos_horimetro' },
  { id: '8', nome: 'Orçamentos de Obra', tabela: 'orcamentos' },
  { id: '9', nome: 'Contas a Pagar', tabela: 'contas_pagar' },
  { id: '10', nome: 'Contas a Receber', tabela: 'contas_receber' },
  { id: '11', nome: 'Clientes & Fazendas', tabela: 'clientes' },
  { id: '12', nome: 'Checklists de Inspeção', tabela: 'checklists_diarios' },
];

export function useMasterHealthCheck() {
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inventario, setInventario] = useState<TableInventoryItem[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckData>({
    status: 'operacional',
    latenciaMs: null,
    timestamp: '--:--:--',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Conectado',
    totalTabelasOnline: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const executarHealthCheck = useCallback(async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      // 1. Latência do ping
      const { error: pingErr } = await supabase
        .from('tenants')
        .select('id', { count: 'exact', head: true });
      
      const duration = Math.round(performance.now() - start);

      // 2. Inventário de tabelas
      const resultados: TableInventoryItem[] = await Promise.all(
        TABELAS_MONITORADAS.map(async (t) => {
          try {
            const { count, error } = await supabase
              .from(t.tabela)
              .select('id', { count: 'exact', head: true });
            
            if (error) {
              return { ...t, contagem: null, status: 'erro' as const };
            }
            return {
              ...t,
              contagem: count ?? 0,
              status: (count && count > 0 ? 'online' : 'vazio') as 'online' | 'vazio',
            };
          } catch {
            return { ...t, contagem: null, status: 'erro' as const };
          }
        })
      );

      const tabelasAtivas = resultados.filter((r) => r.status !== 'erro').length;

      setInventario(resultados);
      setHealthData({
        status: pingErr ? 'offline' : duration > 1200 ? 'lento' : 'operacional',
        latenciaMs: duration,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Online',
        totalTabelasOnline: tabelasAtivas,
      });
    } catch {
      setHealthData((prev) => ({
        ...prev,
        status: 'offline',
        latenciaMs: null,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    executarHealthCheck();
  }, [executarHealthCheck]);

  useEffect(() => {
    if (isAuto) {
      timerRef.current = setInterval(() => {
        executarHealthCheck();
      }, 10000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuto, executarHealthCheck]);

  return {
    isAuto,
    setIsAuto,
    isLoading,
    healthData,
    inventario,
    executarHealthCheck,
  };
}
