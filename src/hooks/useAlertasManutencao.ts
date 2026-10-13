import { useEffect, useMemo } from 'react';
import { useManutencoes } from './useManutencoes';

export type NivelAlerta = 'VENCIDA' | 'PROXIMA' | 'CORRETIVA';

export interface AlertaManutencao {
  id: string;
  maquina: string;
  servico: string;
  nivel: NivelAlerta;
  /** Diferença até/além da revisão, na unidade do equipamento. */
  diferenca: number;
  unidade: 'h' | 'km';
  leituraAtual: number;
  leituraAlvo: number;
}

const REFRESH_MS = 5 * 60 * 1000;
const ordem: Record<NivelAlerta, number> = { CORRETIVA: 0, VENCIDA: 1, PROXIMA: 2 };

/**
 * Alertas de revisão derivados dos planos de manutenção e da leitura atual
 * (horímetro/km) de cada equipamento. Atualiza periodicamente e ao voltar para a aba.
 */
export function useAlertasManutencao() {
  const { data, isLoading, refetch } = useManutencoes();

  useEffect(() => {
    const timer = setInterval(refetch, REFRESH_MS);
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [refetch]);

  const alertas = useMemo<AlertaManutencao[]>(() => {
    const vistos = new Set<string>();
    const lista: AlertaManutencao[] = [];

    data.forEach((p) => {
      const corretivaChecklist = p.tipo_manutencao === 'CORRETIVA' && (p.descricao_servico || '').includes('[CHK:');
      const atual = Number(p.horimetro_atual_maquina) || 0;
      const alvo = Number(p.proximo_horimetro_alvo ?? p.horimetro_proxima_troca) || 0;
      const unidade = p.unidade_medicao || 'h';
      const servico = (p.descricao_servico || p.tipo_servico_nome || 'Manutenção').replace(/\s*\[CHK:[^\]]*\]/, '');

      if (corretivaChecklist) {
        if (p.status !== 'EM_DIA') {
          lista.push({ id: p.id, maquina: p.maquina_nome || p.maquina_codigo || 'Equipamento', servico, nivel: 'CORRETIVA', diferenca: 0, unidade, leituraAtual: atual, leituraAlvo: alvo });
        }
        return;
      }
      if (p.tipo_manutencao === 'CORRETIVA') return;

      // Plano mais recente por máquina+serviço (lista já vem do mais novo para o mais antigo)
      const chave = `${p.maquina_id}|${servico.toLowerCase()}`;
      if (vistos.has(chave)) return;
      vistos.add(chave);

      if (p.status === 'ATRASADO' || p.status === 'PROXIMO_VENCIMENTO') {
        lista.push({
          id: p.id,
          maquina: p.maquina_nome || p.maquina_codigo || 'Equipamento',
          servico,
          nivel: p.status === 'ATRASADO' ? 'VENCIDA' : 'PROXIMA',
          diferenca: Math.abs(alvo - atual),
          unidade,
          leituraAtual: atual,
          leituraAlvo: alvo
        });
      }
    });

    return lista.sort((a, b) => ordem[a.nivel] - ordem[b.nivel] || a.diferenca - b.diferenca);
  }, [data]);

  return { alertas, isLoading, refetch };
}
