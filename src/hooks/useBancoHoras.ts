import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ExtratoBancoHoras, Funcionario } from '../types/rh.types';

export function useBancoHoras() {
  const [extratos, setExtratos] = useState<ExtratoBancoHoras[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarBancoHoras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const agora = new Date();
      const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
        .toISOString()
        .slice(0, 10);

      const [funcsRes, bdeRes] = await Promise.all([
        supabase.from('rh_funcionarios').select('*').order('nome', { ascending: true }),
        supabase
          .from('daily_bulletins')
          .select('operador_id, operator_name, total_hours, hora_inicio_jornada, hora_fim_jornada, initial_hourmeter, final_hourmeter')
          .gte('date', primeiroDiaMes)
      ]);

      if (funcsRes.error) throw new Error(funcsRes.error.message);
      if (bdeRes.error) throw new Error(bdeRes.error.message);

      const funcionarios = (funcsRes.data || []) as Funcionario[];
      const bulletins = bdeRes.data || [];

      // Somar horas apontadas no mês por operador_id ou nome
      const horasPorOperador: Record<string, number> = {};
      bulletins.forEach((b) => {
        const key = b.operador_id;
        if (!key) return;

        // Prioridade 1: coluna total_hours persistida no banco
        let horas = Number(b.total_hours);

        // Prioridade 2: cálculo a partir de hora_inicio_jornada e hora_fim_jornada
        if (isNaN(horas) || horas <= 0) {
          if (b.hora_inicio_jornada && b.hora_fim_jornada) {
            const [h1, m1] = b.hora_inicio_jornada.split(':').map(Number);
            const [h2, m2] = b.hora_fim_jornada.split(':').map(Number);
            if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
              horas = Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
            }
          }
        }

        // Prioridade 3 (fallback): diferença de horímetro da máquina
        if (isNaN(horas) || horas <= 0) {
          const diff = Number(b.final_hourmeter) - Number(b.initial_hourmeter);
          horas = Math.max(0, isNaN(diff) ? 0 : diff);
        }

        horasPorOperador[key] = (horasPorOperador[key] || 0) + horas;
      });

      const resultado: ExtratoBancoHoras[] = funcionarios.map((fn) => {
        const limiteDiario = Number(fn.limite_horas_diario) || 8;
        const limiteMensal = Number((limiteDiario * 22).toFixed(1)); // 22 dias úteis
        const totalTrabalhado = Number((horasPorOperador[fn.id] || 0).toFixed(1));
        const saldoHoras = Number((totalTrabalhado - limiteMensal).toFixed(1));
        const valorHoraExtra = Number(fn.valor_hora_extra) || (Number(fn.custo_hora_normal) || 25) * 1.5;

        // Horas extras se totalTrabalhado > limiteMensal
        const horasExcedentes = Math.max(0, saldoHoras);
        const custoEstimadoExtra = Number((horasExcedentes * valorHoraExtra).toFixed(2));

        return {
          funcionarioId: fn.id,
          nome: fn.nome,
          cargo: fn.cargo.replace('_', ' '),
          totalHorasMes: totalTrabalhado,
          limiteMensal,
          saldoHoras,
          horasExtras: horasExcedentes,
          custoEstimadoExtra,
          valorHoraExtra,
          statusSaldo: saldoHoras > 0 ? 'ESTOURO' : 'POSITIVO'
        };
      });

      setExtratos(resultado);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao calcular banco de horas';
      setError(msg);
      setExtratos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarBancoHoras();
  }, [carregarBancoHoras]);

  return {
    extratos,
    loading,
    error,
    recarregar: carregarBancoHoras
  };
}
