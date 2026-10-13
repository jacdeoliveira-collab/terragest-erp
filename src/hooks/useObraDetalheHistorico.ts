import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Obra } from '../types/obras.types';
import type { AbastecimentoItem } from '../types/abastecimento.types';

export interface ObraDetalheHistoricoData {
  custoTotal: number;
  custoCombustivel: number;
  litrosCombustivel: number;
  custoManutencao: number;
  totalHorasApontadas: number;
  abastecimentos: AbastecimentoItem[];
  boletins: Array<{ id: string; date: string; equipment_code?: string; operador_nome?: string; cliente_nome?: string; total_hours: number }>;
}

const INICIAL: ObraDetalheHistoricoData = {
  custoTotal: 0,
  custoCombustivel: 0,
  litrosCombustivel: 0,
  custoManutencao: 0,
  totalHorasApontadas: 0,
  abastecimentos: [],
  boletins: []
};

export function useObraDetalheHistorico(obra?: Obra | null) {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<ObraDetalheHistoricoData>(INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!obra?.id) {
      setData(INICIAL);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let qAbast = supabase.from('abastecimentos').select('*').eq('obra_id', obra.id).order('data', { ascending: false });
      let qManut = supabase.from('planos_manutencao').select('valor_pecas, valor_mao_obra').eq('obra_id', obra.id);
      let qBde = supabase.from('daily_bulletins').select('id, date, total_hours, equipment_id, operador_id').eq('obra_id', obra.id).order('date', { ascending: false });
      let qServ = supabase.from('servicos_horimetro').select('*').order('created_at', { ascending: false });

      if (tenantAtivoId) {
        qAbast = qAbast.eq('tenant_id', tenantAtivoId);
        qManut = qManut.eq('tenant_id', tenantAtivoId);
        qBde = qBde.eq('tenant_id', tenantAtivoId);
        qServ = qServ.eq('tenant_id', tenantAtivoId);
      }

      const [resAbast, resManut, resBde, resServ] = await Promise.all([qAbast, qManut, qBde, qServ]);

      const abastecimentos: AbastecimentoItem[] = resAbast.data || [];
      const combustivelValor = abastecimentos.reduce((acc, a) => acc + (Number(a.valor_total) || 0), 0);
      const combustivelLitros = abastecimentos.reduce((acc, a) => acc + (Number(a.quantidade_litros) || 0), 0);

      let manutencaoValor = 0;
      (resManut.data || []).forEach((m) => {
        manutencaoValor += (Number(m.valor_pecas) || 0) + (Number(m.valor_mao_obra) || 0);
      });

      let servicosLista = resServ.data || [];
      try {
        const cached = localStorage.getItem(`terragest_servicos_horimetro_${tenantAtivoId}`);
        if (cached) {
          const locais = JSON.parse(cached);
          if (Array.isArray(locais) && locais.length > 0) {
            const idsRemotos = new Set(servicosLista.map((s: any) => s.id));
            const novosLocais = locais.filter((l: any) => !idsRemotos.has(l.id));
            servicosLista = [...servicosLista, ...novosLocais];
          }
        }
      } catch {
        // Ignora erro de storage local
      }

      const ehCentroHorasVendidas = obra.nome?.toLowerCase().includes('horas') || obra.nome?.toLowerCase().includes('vendidas');
      const servicosValidos = servicosLista.filter((s: any) => {
        if (s.obra_id === obra.id) return true;
        if (!s.obra_id && ehCentroHorasVendidas) return true;
        return false;
      });

      let totalHoras = 0;
      const apontamentos: Array<{ id: string; date: string; equipment_code?: string; operador_nome?: string; cliente_nome?: string; total_hours: number }> = [];

      (resBde.data || []).forEach((b) => {
        const h = Number(b.total_hours) || 0;
        totalHoras += h;
        apontamentos.push({
          id: b.id,
          date: b.date,
          equipment_code: b.equipment_id ? String(b.equipment_id).slice(0, 8) : undefined,
          operador_nome: b.operador_id ? 'Operador Registrado' : undefined,
          total_hours: h
        });
      });

      servicosValidos.forEach((s: any) => {
        const h = Number(s.horas_trabalhadas) || 0;
        totalHoras += h;
        apontamentos.push({
          id: s.id,
          date: s.data_fim || s.data_inicio || s.created_at?.slice(0, 10),
          equipment_code: s.maquina_nome,
          operador_nome: s.operador_nome,
          cliente_nome: s.cliente_nome,
          total_hours: h
        });
      });

      setData({
        custoTotal: combustivelValor + manutencaoValor,
        custoCombustivel: combustivelValor,
        litrosCombustivel: combustivelLitros,
        custoManutencao: manutencaoValor,
        totalHorasApontadas: totalHoras,
        abastecimentos,
        boletins: apontamentos
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar resumo da obra';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [obra?.id, tenantAtivoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { data, isLoading, error, refetch: carregar };
}
