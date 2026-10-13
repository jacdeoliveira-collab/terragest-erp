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

      const [funcRes, bdeRes, servRes] = await Promise.all([
        supabase.from('rh_funcionarios').select('*').order('nome', { ascending: true }),
        supabase.from('daily_bulletins').select('*').gte('date', startDate).lte('date', endDate),
        supabase.from('servicos_horimetro').select('*').lte('data_inicio', endDate)
      ]);

      if (funcRes.error) throw new Error(funcRes.error.message);

      const bdes = (bdeRes.data || []) as DailyBulletin[];
      const servicos = (servRes.data || []).filter((s: any) => {
        const fim = s.data_fim || s.data_inicio;
        return fim >= startDate && s.data_inicio <= endDate;
      }) as any[];

      // Converter serviços comerciais por horímetro em apontamentos compatíveis de jornada
      const apontamentosServicos: DailyBulletin[] = servicos.map((s) => ({
        id: s.id,
        equipment_id: s.maquina_id || '',
        date: s.data_inicio,
        total_hours: Number(s.horas_trabalhadas) || 0,
        horas_produtivas: Number(s.horas_trabalhadas) || 0,
        operador_id: s.operador_id,
        operator_name: s.operador_nome,
        status: 'SYNCED',
        initial_hourmeter: Number(s.horimetro_inicial) || 0,
        final_hourmeter: Number(s.horimetro_final) || 0,
        activities: s.descricao_servico,
        created_at: s.created_at
      } as unknown as DailyBulletin));

      setFuncionarios((funcRes.data || []) as Funcionario[]);
      setBulletins([...bdes, ...apontamentosServicos]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar dados da folha';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [anoMes]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const itensFolha: ItemFolhaFechamento[] = useMemo(() => {
    const bdePorOperador: Record<string, DailyBulletin[]> = {};

    bulletins.forEach((b) => {
      const keyId = b.operador_id;
      const keyNome = b.operator_name ? b.operator_name.trim().toLowerCase() : '';
      if (keyId) {
        if (!bdePorOperador[keyId]) bdePorOperador[keyId] = [];
        bdePorOperador[keyId].push(b);
      }
      if (keyNome) {
        if (!bdePorOperador[keyNome]) bdePorOperador[keyNome] = [];
        bdePorOperador[keyNome].push(b);
      }
    });

    return funcionarios.map((fn) => {
      const list = bdePorOperador[fn.id] || bdePorOperador[fn.nome.trim().toLowerCase()] || [];
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

  return { itensFolha, totais, loading, error, recarregar: carregarDados };
}
