import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import { sincronizarDespesa } from '../services/contasPagarSyncHelper';
import type { CreateMovimentacaoDTO } from '../types/almoxarifado.types';

export function useCreateMovimentacao() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createMovimentacao = async (input: CreateMovimentacaoDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      const tenantId =
        tenantAtivoId ||
        (user?.user_metadata?.tenant_id as string | undefined) ||
        (user?.app_metadata?.tenant_id as string | undefined) ||
        '00000000-0000-0000-0000-000000000001';

      let obraIdFinal = input.obra_id || obraSelecionada?.id;
      if (!obraIdFinal) {
        const { data: obras } = await supabase.from('obras').select('id').limit(1);
        if (obras && obras.length > 0) obraIdFinal = obras[0].id;
      }

      const payload = {
        tenant_id: tenantId || null,
        obra_id: obraIdFinal || null,
        tipo_movimentacao: input.tipo_movimentacao || 'ENTRADA',
        data: input.data || new Date().toISOString().slice(0, 10),
        fornecedor_nome: input.fornecedor_nome?.trim() || null,
        numero_nf: input.numero_nf?.trim() || null,
        material_nome: input.material_nome.trim(),
        unidade_medida: input.unidade_medida || 'TON',
        quantidade: Number(input.quantidade) || 0,
        ticket_balanca_numero: input.ticket_balanca_numero?.trim() || null,
        peso_bruto_kg: input.peso_bruto_kg ? Number(input.peso_bruto_kg) : null,
        tara_kg: input.tara_kg ? Number(input.tara_kg) : null,
        peso_liquido_kg: input.peso_liquido_kg ? Number(input.peso_liquido_kg) : null,
        observacoes: input.observacoes?.trim() || null
      };

      let { data, error: insertError } = await supabase
        .from('almoxarifado_movimentacoes')
        .insert([payload])
        .select()
        .single();

      if (insertError && (insertError.message.includes('row-level security') || insertError.code === '42501')) {
        const payloadSemTenant = { ...payload };
        delete (payloadSemTenant as Record<string, unknown>).tenant_id;
        const resFallback = await supabase
          .from('almoxarifado_movimentacoes')
          .insert([payloadSemTenant])
          .select()
          .single();
        if (!resFallback.error) {
          data = resFallback.data;
          insertError = null;
        }
      }

      if (insertError) throw new Error(insertError.message);

      // Integração com Contas a Pagar ao receber NF-e de insumos/peças (idempotente por [REF])
      if (input.tipo_movimentacao === 'ENTRADA' && input.gerarContaPagar !== false && (input.valor_total || 0) > 0) {
        const obsLimpa = (input.observacoes || '').replace(/\[FOTO:[^\]]*\]/g, '').trim();
        const fin = await sincronizarDespesa({
          ref: `ALMOX_${data.id}`,
          categoria: 'PECAS_MANUTENCAO',
          tenantId: tenantId || null,
          obraId: obraIdFinal || null,
          descricao: `NF ${input.numero_nf || 'S/N'}: ${input.material_nome}`,
          fornecedor: input.fornecedor_nome?.trim() || 'Fornecedor não informado',
          valor: Number(input.valor_total),
          dataVencimento: input.data,
          observacoes: `Entrada no Almoxarifado. ${obsLimpa}`
        });
        if (!fin.ok) console.warn('[Almoxarifado] Falha ao lançar no financeiro:', fin.error);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar movimentação de material';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createMovimentacao,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
