import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { isVehicleOrTruck } from '../utils/equipmentMeasurement';
import { sincronizarDespesa } from '../services/contasPagarSyncHelper';
import { useTenantContext } from '../contexts/TenantContext';
import type { CreateAbastecimentoDTO } from '../types/abastecimento.types';

export function useCreateAbastecimento() {
  const { tenantAtivoId } = useTenantContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createAbastecimento = async (input: CreateAbastecimentoDTO) => {
    if (isSubmitting) return { data: null, error: null };
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      const docExtra = input.servico_id ? `[REF:SERV_${input.servico_id}]` : '';
      const docCompleto = [input.numero_requisicao_nf?.trim(), docExtra].filter(Boolean).join(' ').trim() || null;

      const payload = {
        obra_id: input.obra_id,
        maquina_id: input.maquina_id,
        operador_id: input.operador_id || null,
        data: input.data,
        origem: input.origem || 'POSTO',
        comboio_id: input.origem === 'COMBOIO' ? (input.comboio_id || null) : null,
        qtd_oleo_litros: Number(input.qtd_oleo_litros) || 0,
        qtd_graxa_kg: Number(input.qtd_graxa_kg) || 0,
        tipo_combustivel: input.tipo_combustivel,
        quantidade_litros: Number(input.quantidade_litros),
        horimetro_momento: Number(input.horimetro_momento),
        valor_total: Number(input.valor_total),
        valor_unitario: input.valor_unitario ? Number(input.valor_unitario) : Number((Number(input.valor_total) / (Number(input.quantidade_litros) || 1)).toFixed(3)),
        posto_fornecedor: input.posto_fornecedor?.trim() || null,
        numero_requisicao_nf: docCompleto
      };

      const { data, error: insertError } = await supabase
        .from('abastecimentos')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Abastecimento avulso em posto (não vinculado a serviço nem comboio interno) -> Contas a Pagar
      if (!input.servico_id && payload.origem !== 'COMBOIO' && payload.valor_total > 0) {
        const tenantId = tenantAtivoId || (user.user_metadata?.tenant_id as string | undefined);
        const fin = await sincronizarDespesa({
          ref: `ABAST_${data.id}`,
          categoria: 'COMBUSTIVEL',
          tenantId,
          obraId: payload.obra_id,
          descricao: `Diesel ${payload.tipo_combustivel || ''}: ${payload.quantidade_litros}L${payload.posto_fornecedor ? ` - ${payload.posto_fornecedor}` : ''}`,
          fornecedor: payload.posto_fornecedor || 'Posto de Combustível',
          valor: payload.valor_total,
          dataVencimento: payload.data,
          observacoes: `Doc: ${input.numero_requisicao_nf?.trim() || 'S/N'}`
        });
        if (!fin.ok) console.warn('[Abastecimento] Falha ao lançar no financeiro:', fin.error);
      }

      // Atualiza o horímetro da máquina se o horímetro no abastecimento for maior
      if (payload.horimetro_momento > 0) {
        await supabase
          .from('equipment')
          .update({ current_hourmeter: payload.horimetro_momento })
          .eq('id', input.maquina_id)
          .lt('current_hourmeter', payload.horimetro_momento);
      }

      // Se vinculado a um serviço de locação por horímetro, atualiza o serviço automaticamente
      if (input.servico_id) {
        const { data: serv } = await supabase
          .from('servicos_horimetro')
          .select('*')
          .eq('id', input.servico_id)
          .maybeSingle();

        if (serv) {
          const { data: eq } = await supabase.from('equipment').select('code, name, category, type').eq('id', input.maquina_id).maybeSingle();
          const ehApoio = isVehicleOrTruck(eq);
          const addLitros = Number(payload.quantidade_litros) || 0;
          const addValor = Number(payload.valor_total) || 0;

          const nMaqL = ehApoio ? Number(serv.combustivel_maquina_litros || 0) : Number(serv.combustivel_maquina_litros || 0) + addLitros;
          const nMaqV = ehApoio ? Number(serv.combustivel_maquina_valor || 0) : Number(serv.combustivel_maquina_valor || 0) + addValor;
          const nApoioL = ehApoio ? Number(serv.combustivel_apoio_litros || 0) + addLitros : Number(serv.combustivel_apoio_litros || 0);
          const nApoioV = ehApoio ? Number(serv.combustivel_apoio_valor || 0) + addValor : Number(serv.combustivel_apoio_valor || 0);
          const nTotComb = nMaqV + nApoioV;
          const nDesp = nTotComb + Number(serv.despesa_operador || 0) + Number(serv.despesa_apoio || 0) + Number(serv.despesa_manutencao || 0);
          const fat = Number(serv.faturamento_bruto || 0);
          const lucro = fat - nDesp;
          const margem = fat > 0 ? Number(((lucro / fat) * 100).toFixed(1)) : 0;

          await supabase.from('servicos_horimetro').update({
            combustivel_maquina_litros: nMaqL,
            combustivel_maquina_valor: nMaqV,
            combustivel_apoio_litros: nApoioL,
            combustivel_apoio_valor: nApoioV,
            combustivel_total_valor: nTotComb,
            despesas_total: nDesp,
            lucro_liquido: lucro,
            margem_lucro: margem
          }).eq('id', input.servico_id);
        }
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar abastecimento';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createAbastecimento,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
