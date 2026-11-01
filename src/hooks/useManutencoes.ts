import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import { isVehicleOrTruck } from '../utils/equipmentMeasurement';
import { calcularStatusRevisao } from '../utils/revisaoAlertas';
import { extrairMetadadosTipoServico } from '../services/manutencaoFinanceiroSync';
import type { PlanoManutencaoItem } from '../types/manutencao.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export function useManutencoes() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<PlanoManutencaoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;

      let queryPlanos = supabase.from('planos_manutencao').select('*').order('created_at', { ascending: false });
      let queryEquips = supabase.from('equipment').select('id, code, name, current_hourmeter, category, type');
      let queryObras = supabase.from('obras').select('id, nome');
      let queryDocs = supabase.from('equipamento_documentos').select('drive_url, observacoes').ilike('observacoes', '%[MANUT_%');

      queryPlanos = aplicarFiltroTenant(queryPlanos, currentTenant);
      queryEquips = aplicarFiltroTenant(queryEquips, currentTenant);
      queryObras = aplicarFiltroTenant(queryObras, currentTenant);
      queryDocs = aplicarFiltroTenant(queryDocs, currentTenant);

      if (obraSelecionada?.id) {
        queryPlanos = queryPlanos.eq('obra_id', obraSelecionada.id);
      }

      const [planosRes, equipsRes, obrasRes, docsRes] = await Promise.all([
        queryPlanos,
        queryEquips,
        queryObras,
        queryDocs
      ]);

      if (planosRes.error) {
        throw new Error(planosRes.error.message);
      }

      const equipsMap = new Map((equipsRes.data || []).map((eq) => [eq.id, eq]));
      const obrasMap = new Map((obrasRes.data || []).map((ob) => [ob.id, ob.nome]));
      const comprovantesMap = new Map<string, string>();

      (docsRes.data || []).forEach((doc) => {
        const match = doc.observacoes?.match(/\[MANUT_([a-f0-9-]+)\]/i);
        if (match?.[1] && doc.drive_url) {
          comprovantesMap.set(match[1], doc.drive_url);
        }
      });

      const formatados: PlanoManutencaoItem[] = (planosRes.data || []).map((raw) => {
        const eq = equipsMap.get(raw.maquina_id || raw.equipment_id);
        const obraNome = raw.obra_id ? obrasMap.get(raw.obra_id) : undefined;
        const ultHorimetro = Number(raw.ultimo_horimetro_realizado ?? raw.ultimo_horimetro ?? 0);
        const intervHoras = Number(raw.intervalo_horas ?? 250);
        const proxAlvo = Number(raw.horimetro_proxima_troca) || (ultHorimetro + intervHoras);
        const horimetroAtual = Number(eq?.current_hourmeter) || 0;
        const valorPecas = Number(raw.valor_pecas) || 0;
        const valorMaoObra = Number(raw.valor_mao_obra) || 0;
        const meta = extrairMetadadosTipoServico(raw.tipo_servico);

        const isKm = isVehicleOrTruck(eq);
        const statusCalc = calcularStatusRevisao(horimetroAtual, proxAlvo, isKm);
        const servicoNome = raw.servico || raw.tipo_servico_nome || raw.descricao_servico || 'Manutenção Preventiva';

        return {
          ...raw,
          tipo_servico: servicoNome,
          tipo_servico_nome: servicoNome,
          descricao_servico: servicoNome,
          data_servico: raw.data_servico || raw.data_ultima_execucao || raw.created_at?.slice(0, 10),
          tipo_manutencao: raw.tipo_manutencao || meta.tipoManutencao,
          responsavel_mecanico: raw.responsavel_mecanico || meta.responsavelMecanico,
          ultimo_horimetro_realizado: ultHorimetro,
          intervalo_horas: intervHoras,
          maquina_codigo: eq?.code,
          maquina_nome: eq?.name,
          unidade_medicao: isKm ? 'km' : 'h',
          horimetro_atual_maquina: horimetroAtual,
          proximo_horimetro_alvo: proxAlvo,
          horimetro_proxima_troca: proxAlvo,
          obra_nome: obraNome,
          valor_pecas: valorPecas,
          valor_mao_obra: valorMaoObra,
          valor_total: valorPecas + valorMaoObra,
          comprovante_url: raw.comprovante_url || comprovantesMap.get(raw.id),
          status: raw.status === 'REALIZADO' ? 'EM_DIA' : statusCalc
        };
      });

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar manutenções';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, obraSelecionada?.id]);

  useEffect(() => {
    fetchPlanos();
  }, [fetchPlanos]);

  return { data, isLoading, error, refetch: fetchPlanos };
}
