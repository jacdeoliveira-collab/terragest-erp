import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemComissaoOperador, Funcionario } from '../types/rh.types';
import { calcularHorasBde } from '../utils/comissaoCalculos';

export function useRelatorioComissoes() {
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [valoresHora, setValoresHora] = useState<Record<string, number>>({});
  const [itensBrutos, setItensBrutos] = useState<Omit<ItemComissaoOperador, 'valorHoraComissao' | 'totalPagar'>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarRelatorio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [funcsRes, bdeRes, equipRes, servRes] = await Promise.all([
        supabase.from('rh_funcionarios').select('id, nome, cpf, cargo, custo_hora_normal'),
        supabase.from('daily_bulletins').select('*').gte('date', dataInicio).lte('date', dataFim),
        supabase.from('equipment').select('id, code, name'),
        supabase.from('servicos_horimetro').select('*').lte('data_inicio', dataFim)
      ]);

      if (funcsRes.error) throw new Error(funcsRes.error.message);

      const funcs = (funcsRes.data || []) as Funcionario[];
      const bdes = bdeRes.data || [];
      const equips = equipRes.data || [];
      const servicos = (servRes.data || []).filter((s: any) => {
        const fim = s.data_fim || s.data_inicio;
        return fim >= dataInicio && s.data_inicio <= dataFim;
      });

      const mapaFuncs = new Map<string, Funcionario>();
      funcs.forEach(f => {
        mapaFuncs.set(f.id, f);
        mapaFuncs.set(f.nome.trim().toLowerCase(), f);
      });

      const mapaEquips = new Map<string, string>();
      equips.forEach((eq: any) => { mapaEquips.set(eq.id, `${eq.code} - ${eq.name}`); });

      const agrupado: Record<string, any> = {};

      const obterOuCriarAgrupado = (opId: string, opNome?: string) => {
        const func = (opId ? mapaFuncs.get(opId) : undefined) || (opNome ? mapaFuncs.get(opNome.trim().toLowerCase()) : undefined);
        const idFinal = func?.id || opId || 'Desconhecido';
        if (!agrupado[idFinal]) {
          agrupado[idFinal] = {
            operadorId: idFinal,
            operadorNome: func?.nome || opNome || 'Operador Não Identificado',
            cargo: func?.cargo || 'Operador',
            documento: func?.cpf || '',
            maquinas: new Set<string>(),
            horasTotal: 0,
            qtdBdes: 0,
            custoPadrao: Number(func?.custo_hora_normal) || 0
          };
        }
        return agrupado[idFinal];
      };

      bdes.forEach(b => {
        const item = obterOuCriarAgrupado(b.operador_id, b.operator_name);
        const maq = (b.equipment_id && mapaEquips.get(b.equipment_id)) || (b.equipment_code ? `${b.equipment_code}` : '');
        if (maq) item.maquinas.add(maq.trim());
        item.horasTotal += calcularHorasBde(b);
        item.qtdBdes += 1;
      });

      servicos.forEach(s => {
        const item = obterOuCriarAgrupado(s.operador_id, s.operador_nome);
        if (s.maquina_nome) item.maquinas.add(s.maquina_nome.trim());
        item.horasTotal += Number(s.horas_trabalhadas) || 0;
        item.qtdBdes += 1;
        if (Number(s.valor_hora_operador) > 0 && item.custoPadrao === 0) {
          item.custoPadrao = Number(s.valor_hora_operador);
        }
      });

      const lista = Object.values(agrupado).map((it: any) => ({
        operadorId: it.operadorId,
        operadorNome: it.operadorNome,
        cargo: it.cargo,
        documento: it.documento,
        maquinasOperadas: Array.from(it.maquinas as Set<string>),
        totalHorasTrabalhadas: Number(it.horasTotal.toFixed(2)),
        quantidadeBoletins: it.qtdBdes
      }));

      lista.sort((a, b) => b.totalHorasTrabalhadas - a.totalHorasTrabalhadas);
      setItensBrutos(lista);

      setValoresHora(prev => {
        const next = { ...prev };
        Object.values(agrupado).forEach((it: any) => {
          if (next[it.operadorId] === undefined && it.custoPadrao > 0) {
            next[it.operadorId] = it.custoPadrao;
          }
        });
        return next;
      });
    } catch (err: any) {
      setError(err?.message || 'Erro ao calcular relatório de comissões.');
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => { carregarRelatorio(); }, [carregarRelatorio]);

  const handleSetValorHora = (id: string, val: number) => {
    setValoresHora(prev => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const relatorio: ItemComissaoOperador[] = useMemo(() => {
    return itensBrutos.map(it => {
      const vHora = valoresHora[it.operadorId] || 0;
      return {
        ...it,
        valorHoraComissao: vHora,
        totalPagar: Number((it.totalHorasTrabalhadas * vHora).toFixed(2))
      };
    });
  }, [itensBrutos, valoresHora]);

  return { dataInicio, setDataInicio, dataFim, setDataFim, relatorio, loading, error, recarregar: carregarRelatorio, handleSetValorHora };
}
