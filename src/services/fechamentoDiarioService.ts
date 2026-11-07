import { supabase } from '../lib/supabase';

export interface FechamentoDiarioInput {
  tenantId?: string | null;
  obraId?: string | null;
  servicoId?: string | null;
  clienteNome?: string;
  equipmentId: string;
  equipmentName?: string;
  operadorId?: string | null;
  operadorNome: string;
  data: string;
  horimetroInicial: number;
  horimetroFinal: number;
  horasProdutivas: number;
  horasDeslocamento: number;
  horasOciosas?: number;
  frenteServico?: string;
  observacoes?: string;
  fotoHorimetroUrl?: string;
}

export async function registrarFechamentoDiarioTarde(
  input: FechamentoDiarioInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sessão expirada. Faça login novamente.');

    const initial = Number(input.horimetroInicial) || 0;
    const final = Number(input.horimetroFinal) || 0;
    if (final < initial) {
      throw new Error('O horímetro da tarde não pode ser menor que o horímetro anterior.');
    }

    const prod = Number(input.horasProdutivas) || 0;
    const desloc = Number(input.horasDeslocamento) || 0;
    const ociosas = Number(input.horasOciosas) || 0;

    let desc = 'Apontamento Diário da Tarde';
    if (desloc > 0 && prod > 0) {
      desc = `Operação (${prod.toFixed(1)}h) + Deslocamento (${desloc.toFixed(1)}h)`;
    } else if (desloc > 0) {
      desc = `Deslocamento / Translado de Máquina (${desloc.toFixed(1)}h)`;
    } else if (prod > 0) {
      desc = `Produção / Trabalho em Campo (${prod.toFixed(1)}h)`;
    }

    const obsTexto = [
      input.frenteServico ? `Frente: ${input.frenteServico}` : '',
      desloc > 0 ? `Translado entre serviços: ${desloc.toFixed(1)}h` : '',
      input.observacoes ? input.observacoes : '',
      input.fotoHorimetroUrl ? `[FOTO_PAINEL:${input.fotoHorimetroUrl}]` : ''
    ].filter(Boolean).join(' | ');

    const payload = {
      tenant_id: input.tenantId || null,
      obra_id: input.obraId || null,
      equipment_id: input.equipmentId,
      operador_id: input.operadorId || null,
      date: input.data,
      operator_name: input.operadorNome || 'Operador',
      client_name: input.clienteNome || input.frenteServico || 'Controle Diário de Máquina',
      work_location: input.frenteServico || input.clienteNome || 'Frente Operacional / Deslocamento',
      initial_hourmeter: initial,
      final_hourmeter: final,
      horas_produtivas: prod,
      horas_ociosas: desloc + ociosas,
      motivo_parada: desloc > 0 ? 'Deslocamento / Translado' : (ociosas > 0 ? 'Parada Operacional' : null),
      service_description: desc,
      notes: obsTexto,
      status: 'SUBMITTED',
      status_aprovacao: 'APROVADO',
      assinado_por_pin: true
    };

    const { error: insErr } = await supabase.from('daily_bulletins').insert([payload]);
    if (insErr) throw new Error(insErr.message);

    if (final > 0) {
      await supabase.from('equipment').update({ current_hourmeter: final }).eq('id', input.equipmentId);

      if (input.servicoId) {
        const { data: srv } = await supabase
          .from('servicos_horimetro')
          .select('id, horimetro_inicial, valor_hora, despesas_total, maquinas_itens')
          .eq('id', input.servicoId)
          .maybeSingle();

        if (srv) {
          const hIni = Number(srv.horimetro_inicial) || initial;
          const horas = Math.max(0, Number((final - hIni).toFixed(2)));
          const vHora = Number(srv.valor_hora) || 0;
          const fatBruto = Number((horas * vHora).toFixed(2));
          const despTotal = Number(srv.despesas_total) || 0;
          const lucro = Number((fatBruto - despTotal).toFixed(2));
          const maqItens = Array.isArray(srv.maquinas_itens) && srv.maquinas_itens.length > 0
            ? srv.maquinas_itens.map((m: any, idx: number) => idx === 0 ? {
                ...m, horimetro_final: final, horas_trabalhadas: horas, faturamento_bruto: fatBruto,
                ...(input.fotoHorimetroUrl ? { foto_horimetro_final: input.fotoHorimetroUrl } : {})
              } : m)
            : undefined;

          await supabase.from('servicos_horimetro').update({
            horimetro_final: final,
            horas_trabalhadas: horas,
            faturamento_bruto: fatBruto,
            lucro_liquido: lucro,
            ...(input.fotoHorimetroUrl ? { foto_horimetro_final: input.fotoHorimetroUrl } : {}),
            ...(maqItens ? { maquinas_itens: maqItens } : {}),
            updated_at: new Date().toISOString()
          }).eq('id', input.servicoId);
        }
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao registrar apontamento diário.'
    };
  }
}

