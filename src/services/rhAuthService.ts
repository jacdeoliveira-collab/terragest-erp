import { supabase } from '../lib/supabase';
import { inviteUserToTenant } from './tenantAuthService';

interface ConvidarColaboradorParams {
  funcionarioId: string;
  email: string;
  nome: string;
}

export async function convidarColaborador({
  funcionarioId,
  email,
  nome
}: ConvidarColaboradorParams): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !emailLimpo.includes('@')) {
      return { success: false, error: 'E-mail de acesso inválido.' };
    }

    const { data: userData } = await supabase.auth.getUser();
    const tenantId = userData.user?.user_metadata?.tenant_id || userData.user?.id;

    // 1. Chamar RPC global invite_user_to_tenant com role 'operador'
    const inviteRes = await inviteUserToTenant({
      email: emailLimpo,
      role: 'operador',
      targetTenantId: tenantId,
      nome
    });

    if (!inviteRes.success) {
      return inviteRes;
    }

    // 2. Atualizar status na tabela rh_funcionarios
    await supabase
      .from('rh_funcionarios')
      .update({
        email_acesso: emailLimpo,
        status_convite: 'PENDENTE',
        updated_at: new Date().toISOString()
      })
      .eq('id', funcionarioId);

    return {
      success: true,
      message: `Convite de acesso registrado para ${emailLimpo}! O colaborador poderá definir sua senha.`
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao enviar convite'
    };
  }
}
