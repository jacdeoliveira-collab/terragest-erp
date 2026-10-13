import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Funcionario } from '../types/rh.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { DailyBulletin } from '../types/bde.types';
import type { FuncionarioHistoricoData, FuncionarioRemuneracaoItem, MaquinaOperadaResumo } from '../types/funcionarioHistorico.types';

const INICIAL: FuncionarioHistoricoData = {
  totalHorasServicos: 0,
  totalHorasBde: 0,
  totalHorasGeral: 0,
  qtdServicos: 0,
  qtdBdes: 0,
  totalGanhos: 0,
  totalPago: 0,
  totalSaldoAberto: 0,
  qtdQuitados: 0,
  maquinasOperadas: [],
  servicos: [],
  bulletins: [],
  remuneracoes: []
};

export function useFuncionarioHistorico(funcionario?: Funcionario | null) {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<FuncionarioHistoricoData>(INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!funcionario?.id) {
      setData(INICIAL);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let qServicos = supabase.from('servicos_horimetro').select('*').order('data_inicio', { ascending: false });
      if (funcionario.id) {
        qServicos = qServicos.or(`operador_id.eq.${funcionario.id},operador_nome.ilike.%${funcionario.nome}%`);
      }
      if (tenantAtivoId) qServicos = qServicos.eq('tenant_id', tenantAtivoId);

      let qBde = supabase.from('daily_bulletins').select('*').order('date', { ascending: false });
      if (funcionario.id) {
        qBde = qBde.or(`operador_id.eq.${funcionario.id},operator_name.ilike.%${funcionario.nome}%`);
      }
      if (tenantAtivoId) qBde = qBde.eq('tenant_id', tenantAtivoId);

      const [resServicos, resBde] = await Promise.all([qServicos, qBde]);
      const servicos: ServicoHorimetro[] = resServicos.data || [];
      const bulletins: DailyBulletin[] = resBde.data || [];

      let totalHorasServicos = 0;
      let totalGanhos = 0;
      let totalPago = 0;
      let totalSaldoAberto = 0;
      let qtdQuitados = 0;
      const mapaMaquinas: Record<string, { totalHoras: number; totalTrabalhos: number }> = {};

      const remuneracoes: FuncionarioRemuneracaoItem[] = servicos.map((s) => {
        const hrs = Number(s.horas_trabalhadas) || 0;
        totalHorasServicos += hrs;
        const nomeM = s.maquina_nome || 'Máquina não informada';
        if (!mapaMaquinas[nomeM]) mapaMaquinas[nomeM] = { totalHoras: 0, totalTrabalhos: 0 };
        mapaMaquinas[nomeM].totalHoras += hrs;
        mapaMaquinas[nomeM].totalTrabalhos += 1;

        const vHora = Number(s.valor_hora_operador) || (hrs > 0 ? Number(s.despesa_operador || 0) / hrs : 0);
        const ganho = Number(s.despesa_operador) > 0 ? Number(s.despesa_operador) : hrs * vHora;
        const pago = Number(s.adiantamento_operador_valor) || 0;
        const saldo = s.saldo_pagar_operador !== undefined ? Number(s.saldo_pagar_operador) : Math.max(0, ganho - pago);
        const status = s.status_pagamento_operador || (saldo <= 0.01 && ganho > 0 ? 'PAGO' : 'PENDENTE');

        totalGanhos += ganho;
        totalPago += pago;
        totalSaldoAberto += saldo;
        if (status === 'PAGO' || (ganho > 0 && saldo <= 0.01)) qtdQuitados += 1;

        return {
          servicoId: s.id,
          data: s.data_inicio || '',
          clienteNome: s.cliente_nome || 'Cliente',
          maquinaNome: nomeM,
          horasTrabalhadas: hrs,
          valorHora: Number(vHora.toFixed(2)),
          totalGanho: Number(ganho.toFixed(2)),
          valorAdiantado: Number(pago.toFixed(2)),
          dataAdiantamento: s.adiantamento_operador_data,
          saldoRestante: Number(saldo.toFixed(2)),
          status,
          dataPagamento: s.data_pagamento_operador
        };
      });

      let totalHorasBde = 0;
      bulletins.forEach((b) => {
        const hrs = Number(b.total_hours) || 0;
        totalHorasBde += hrs;
        const nomeM = b.equipment_name || b.equipment_code || 'Equipamento BDE';
        if (!mapaMaquinas[nomeM]) mapaMaquinas[nomeM] = { totalHoras: 0, totalTrabalhos: 0 };
        mapaMaquinas[nomeM].totalHoras += hrs;
        mapaMaquinas[nomeM].totalTrabalhos += 1;
      });

      const maquinasOperadas: MaquinaOperadaResumo[] = Object.entries(mapaMaquinas)
        .map(([maquinaNome, val]) => ({
          maquinaNome,
          totalHoras: Number(val.totalHoras.toFixed(2)),
          totalTrabalhos: val.totalTrabalhos
        }))
        .sort((a, b) => b.totalHoras - a.totalHoras);

      setData({
        totalHorasServicos: Number(totalHorasServicos.toFixed(2)),
        totalHorasBde: Number(totalHorasBde.toFixed(2)),
        totalHorasGeral: Number((totalHorasServicos + totalHorasBde).toFixed(2)),
        qtdServicos: servicos.length,
        qtdBdes: bulletins.length,
        totalGanhos: Number(totalGanhos.toFixed(2)),
        totalPago: Number(totalPago.toFixed(2)),
        totalSaldoAberto: Number(totalSaldoAberto.toFixed(2)),
        qtdQuitados,
        maquinasOperadas,
        servicos,
        bulletins,
        remuneracoes
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar histórico do colaborador';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [funcionario, tenantAtivoId]);

  useEffect(() => { carregar(); }, [carregar]);

  return { data, isLoading, error, refetch: carregar };
}
