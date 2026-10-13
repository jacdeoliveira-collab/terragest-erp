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
      const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().slice(0, 10);

      const [funcsRes, bdeRes, servRes] = await Promise.all([
        supabase.from('rh_funcionarios').select('*').order('nome', { ascending: true }),
        supabase.from('daily_bulletins').select('operador_id, operator_name, total_hours, hora_inicio_jornada, hora_fim_jornada, initial_hourmeter, final_hourmeter').gte('date', primeiroDiaMes),
        supabase.from('servicos_horimetro').select('operador_id, operador_nome, horas_trabalhadas, data_inicio, data_fim')
      ]);

      if (funcsRes.error) throw new Error(funcsRes.error.message);

      const funcionarios = (funcsRes.data || []) as Funcionario[];
      const bulletins = bdeRes.data || [];
      const servicos = (servRes.data || []).filter((s: any) => {
        const fim = s.data_fim || s.data_inicio;
        return !fim || fim >= primeiroDiaMes;
      });

      // Somar horas apontadas no mês de BDE e Serviços por Horímetro
      const horasPorId: Record<string, number> = {};
      const horasPorNome: Record<string, number> = {};

      const addHoras = (opId?: string, opNome?: string, h: number = 0) => {
        if (opId) horasPorId[opId] = (horasPorId[opId] || 0) + h;
        if (opNome) {
          const k = opNome.trim().toLowerCase();
          horasPorNome[k] = (horasPorNome[k] || 0) + h;
        }
      };

      bulletins.forEach((b) => {
        let horas = Number(b.total_hours);
        if (isNaN(horas) || horas <= 0) {
          if (b.hora_inicio_jornada && b.hora_fim_jornada) {
            const [h1, m1] = b.hora_inicio_jornada.split(':').map(Number);
            const [h2, m2] = b.hora_fim_jornada.split(':').map(Number);
            if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
              horas = Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
            }
          }
        }
        if (isNaN(horas) || horas <= 0) {
          const diff = Number(b.final_hourmeter) - Number(b.initial_hourmeter);
          horas = Math.max(0, isNaN(diff) ? 0 : diff);
        }
        addHoras(b.operador_id, b.operator_name, horas);
      });

      // Integração com Serviços Comerciais de Máquinas por Horímetro
      servicos.forEach((s) => {
        const horas = Number(s.horas_trabalhadas) || 0;
        addHoras(s.operador_id, s.operador_nome, horas);
      });

      const resultado: ExtratoBancoHoras[] = funcionarios.map((fn) => {
        const limiteDiario = Number(fn.limite_horas_diario) || 8;
        const limiteMensal = Number((limiteDiario * 22).toFixed(1));
        const porId = horasPorId[fn.id] || 0;
        const porNome = horasPorNome[fn.nome.trim().toLowerCase()] || 0;
        const totalTrabalhado = Number(Math.max(porId, porNome, porId + (fn.id ? 0 : porNome)).toFixed(1));
        const saldoHoras = Number((totalTrabalhado - limiteMensal).toFixed(1));
        const recebeHE = Number(fn.valor_hora_extra) > 0;
        const valorHoraExtra = recebeHE ? Number(fn.valor_hora_extra) : 0;
        const horasExcedentes = recebeHE ? Math.max(0, saldoHoras) : 0;
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
          statusSaldo: (recebeHE && saldoHoras > 0) ? 'ESTOURO' : 'POSITIVO'
        };
      });

      setExtratos(resultado);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao calcular banco de horas');
      setExtratos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarBancoHoras(); }, [carregarBancoHoras]);

  return { extratos, loading, error, recarregar: carregarBancoHoras };
}
