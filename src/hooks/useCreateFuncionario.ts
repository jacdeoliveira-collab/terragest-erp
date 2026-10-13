import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CreateFuncionarioDTO } from '../types/rh.types';

export function useCreateFuncionario() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createFuncionario = async (input: CreateFuncionarioDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      const tenantId =
        (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) ||
        (user.user_metadata?.tenant_id as string | undefined);

      const payload = {
        tenant_id: tenantId || null,
        nome: input.nome.trim(),
        pin_assinatura: input.pin_assinatura?.trim() || null,
        cpf: input.cpf?.trim() || null,
        rg: input.rg?.trim() || null,
        cnh: input.cnh?.trim() || null,
        validade_cnh: input.validade_cnh || null,
        endereco_completo: input.endereco_completo?.trim() || null,
        ctps: input.ctps?.trim() || null,
        pis_pasep: input.pis_pasep?.trim() || null,
        titulo_eleitor: input.titulo_eleitor?.trim() || null,
        reservista: input.reservista?.trim() || null,
        aso_validade: input.aso_validade || null,
        drive_url_documentos: input.drive_url_documentos?.trim() || null,
        cargo: input.cargo,
        registro_documento: input.registro_documento?.trim() || null,
        validade_documento: input.validade_documento || null,
        telefone: input.telefone?.trim() || null,
        status: input.status,
        salario_base: input.salario_base || 0,
        custo_hora_normal: input.custo_hora_normal || 0,
        valor_hora_extra: input.valor_hora_extra || 0,
        limite_horas_diario: input.limite_horas_diario || 8
      };

      const { data, error: insertError } = await supabase
        .from('rh_funcionarios')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar colaborador';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createFuncionario,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
