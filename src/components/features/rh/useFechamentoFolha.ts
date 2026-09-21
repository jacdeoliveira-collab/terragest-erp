import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Funcionario } from '../../../types/rh.types';
import type { DailyBulletin } from '../../../types/bde.types';
import { calcularItemFolha, type ItemFolhaFechamento } from './fechamentoFolhaCalculos';

export function useFechamentoFolha(anoMes: string) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [bulletins, setBulletins] = useState<DailyBulletin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [anoStr, mesStr] = anoMes.split('-');
      const ano = parseInt(anoStr, 10);
      const mes = parseInt(mesStr, 10);
      const startDate = `${anoStr}-${mesStr}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const endDate = `${anoStr}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;

      const [funcRes, bdeRes] = await Promise.all([
        supabase
          .from('rh_funcionarios')
          .select('*')
          .order('nome', { ascending: true }),
        supabase
          .from('daily_bulletins')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
      ]);

      if (funcRes.error) throw new Error(funcRes.error.message);
      if (bdeRes.error) throw new Error(bdeRes.error.message);

      setFuncionarios((funcRes.data || []) as Funcionario[]);
      setBulletins((bdeRes.data || []) as DailyBulletin[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar dados da folha';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [anoMes]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const itensFolha: ItemFolhaFechamento[] = useMemo(() => {
    const bdePorOperador: Record<string, DailyBulletin[]> = {};

    bulletins.forEach((b) => {
      const key = b.operador_id || b.operator_name;
      if (!key) return;
      if (!bdePorOperador[key]) bdePorOperador[key] = [];
      bdePorOperador[key].push(b);
    });

    return funcionarios.map((fn) => {
      const list = bdePorOperador[fn.id] || bdePorOperador[fn.nome] || [];
      return calcularItemFolha(fn, list);
    });
  }, [funcionarios, bulletins]);

  const totais = useMemo(() => {
    return itensFolha.reduce(
      (acc, item) => ({
        totalFolha: acc.totalFolha + item.custoTotal,
        totalHorasExtrasValor: acc.totalHorasExtrasValor + item.adicionalHorasExtras,
        totalHorasExtrasQtd: acc.totalHorasExtrasQtd + item.totalHorasExtras,
        operadoresComEstouro: acc.operadoresComEstouro + (item.estourouLimite ? 1 : 0)
      }),
      { totalFolha: 0, totalHorasExtrasValor: 0, totalHorasExtrasQtd: 0, operadoresComEstouro: 0 }
    );
  }, [itensFolha]);

  return {
    itensFolha,
    totais,
    loading,
    error,
    recarregar: carregarDados
  };
}
