import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Funcionario } from '../types/rh.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { DailyBulletin } from '../types/bde.types';
import type { FuncionarioHistoricoData, FuncionarioRemuneracaoItem, MaquinaOperadaResumo } from '../types/funcionarioHistorico.types';
import type { ValeColaboradorItem } from '../types/valeRh.types';

const INICIAL: FuncionarioHistoricoData = {
  totalHorasServicos: 0, totalHorasBde: 0, totalHorasGeral: 0, qtdServicos: 0, qtdBdes: 0,
  totalGanhos: 0, totalPago: 0, totalSaldoAberto: 0, qtdQuitados: 0,
  maquinasOperadas: [], servicos: [], bulletins: [], remuneracoes: [], vales: []
};

export function useFuncionarioHistorico(funcionario?: Funcionario | null) {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<FuncionarioHistoricoData>(INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!funcionario?.id) { setData(INICIAL); return; }
    try {
      setIsLoading(true); setError(null);

      let qSrv = supabase.from('servicos_horimetro').select('*').order('data_inicio', { ascending: false });
      qSrv = qSrv.or(`operador_id.eq.${funcionario.id},operador_nome.ilike.%${funcionario.nome}%`);
      if (tenantAtivoId) qSrv = qSrv.eq('tenant_id', tenantAtivoId);

      let qBde = supabase.from('daily_bulletins').select('*').order('date', { ascending: false });
      qBde = qBde.or(`operador_id.eq.${funcionario.id},operator_name.ilike.%${funcionario.nome}%`);
      if (tenantAtivoId) qBde = qBde.eq('tenant_id', tenantAtivoId);

      let qVales = supabase.from('contas_pagar').select('*, contas_bancarias(nome_conta)').eq('categoria', 'FOLHA_RH').order('data_pagamento', { ascending: false });
      qVales = qVales.or(`fornecedor.ilike.%${funcionario.nome}%,observacoes.ilike.%[COLAB_ID:${funcionario.id}]%`);
      if (tenantAtivoId) qVales = qVales.eq('tenant_id', tenantAtivoId);

      const [resSrv, resBde, resVales] = await Promise.all([qSrv, qBde, qVales]);
      const servicos: ServicoHorimetro[] = resSrv.data || [];
      const bulletins: DailyBulletin[] = resBde.data || [];
      const rawVales = resVales.data || [];

      const valesReais = rawVales.filter((cp: any) => {
        const obs = cp.observacoes || '';
        const desc = cp.descricao || '';
        return obs.includes('[VALE_RH]') || desc.toLowerCase().includes('vale');
      });

      const vales: ValeColaboradorItem[] = valesReais.map((cp: any) => ({
        id: cp.id,
        colaboradorId: funcionario.id,
        colaboradorNome: cp.favorecido_nome || cp.fornecedor || funcionario.nome,
        valor: Number(cp.valor) || 0,
        data: cp.data_pagamento || cp.data_vencimento || '',
        formaPagamento: cp.forma_pagamento || 'PIX',
        contaBancariaId: cp.conta_bancaria_id,
        contaBancariaNome: cp.contas_bancarias?.nome_conta || 'Caixa Geral',
        observacao: cp.observacoes?.replace(/\[VALE_RH\]/g, '')?.replace(/\[COLAB_ID:[^\]]+\]/g, '')?.trim() || cp.descricao,
        status: cp.status === 'PAGO' ? 'PAGO' : 'PENDENTE',
        created_at: cp.created_at
      }));

      let totalHorasServicos = 0, totalGanhos = 0, totalPago = 0, totalSaldoAberto = 0, qtdQuitados = 0;
      const mapaMaquinas: Record<string, { totalHoras: number; totalTrabalhos: number }> = {};

      const remuneracoes: FuncionarioRemuneracaoItem[] = servicos.map((s) => {
        const hrs = Number(s.horas_trabalhadas) || 0;
        totalHorasServicos += hrs;
        const nomeM = s.maquina_nome || 'Máquina';
        if (!mapaMaquinas[nomeM]) mapaMaquinas[nomeM] = { totalHoras: 0, totalTrabalhos: 0 };
        mapaMaquinas[nomeM].totalHoras += hrs;
        mapaMaquinas[nomeM].totalTrabalhos += 1;

        const vHora = Number(s.valor_hora_operador) || (hrs > 0 ? Number(s.despesa_operador || 0) / hrs : 0);
        const ganho = Number(s.despesa_operador) > 0 ? Number(s.despesa_operador) : hrs * vHora;
        const pago = Number(s.adiantamento_operador_valor) || 0;
        const saldo = s.saldo_pagar_operador !== undefined ? Number(s.saldo_pagar_operador) : Math.max(0, ganho - pago);
        const status = s.status_pagamento_operador || (saldo <= 0.01 && ganho > 0 ? 'PAGO' : 'PENDENTE');

        totalGanhos += ganho; totalPago += pago; totalSaldoAberto += saldo;
        if (status === 'PAGO' || (ganho > 0 && saldo <= 0.01)) qtdQuitados += 1;

        return {
          servicoId: s.id, data: s.data_inicio || '', clienteNome: s.cliente_nome || 'Cliente', maquinaNome: nomeM,
          horasTrabalhadas: hrs, valorHora: Number(vHora.toFixed(2)), totalGanho: Number(ganho.toFixed(2)),
          valorAdiantado: Number(pago.toFixed(2)), dataAdiantamento: s.adiantamento_operador_data,
          saldoRestante: Number(saldo.toFixed(2)), status, dataPagamento: s.data_pagamento_operador
        };
      });

      const totalValesDiretos = vales.reduce((acc, v) => acc + v.valor, 0);
      const totalPagoConsolidado = totalPago + totalValesDiretos;
      const totalSaldoConsolidado = Math.max(0, totalGanhos - totalPagoConsolidado);

      let totalHorasBde = 0;
      bulletins.forEach((b) => {
        const hrs = Number(b.total_hours) || 0;
        totalHorasBde += hrs;
        const nomeM = b.equipment_name || b.equipment_code || 'BDE';
        if (!mapaMaquinas[nomeM]) mapaMaquinas[nomeM] = { totalHoras: 0, totalTrabalhos: 0 };
        mapaMaquinas[nomeM].totalHoras += hrs;
        mapaMaquinas[nomeM].totalTrabalhos += 1;
      });

      const maquinasOperadas: MaquinaOperadaResumo[] = Object.entries(mapaMaquinas)
        .map(([maquinaNome, val]) => ({ maquinaNome, totalHoras: Number(val.totalHoras.toFixed(2)), totalTrabalhos: val.totalTrabalhos }))
        .sort((a, b) => b.totalHoras - a.totalHoras);

      setData({
        totalHorasServicos: Number(totalHorasServicos.toFixed(2)),
        totalHorasBde: Number(totalHorasBde.toFixed(2)),
        totalHorasGeral: Number((totalHorasServicos + totalHorasBde).toFixed(2)),
        qtdServicos: servicos.length, qtdBdes: bulletins.length,
        totalGanhos: Number(totalGanhos.toFixed(2)),
        totalPago: Number(totalPagoConsolidado.toFixed(2)),
        totalSaldoAberto: Number(totalSaldoConsolidado.toFixed(2)),
        qtdQuitados, maquinasOperadas, servicos, bulletins, remuneracoes, vales
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  }, [funcionario, tenantAtivoId]);

  useEffect(() => { carregar(); }, [carregar]);

  return { data, isLoading, error, refetch: carregar };
}
