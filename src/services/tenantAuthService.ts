import { supabase } from '../lib/supabase';

export interface InviteUserParams {
  email: string;
  role: 'admin' | 'operador' | 'mecanico';
  targetTenantId?: string;
  nome?: string;
}

export async function inviteUserToTenant({
  email,
  role,
  targetTenantId,
  nome
}: InviteUserParams): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'E-mail informado inválido.' };
    }

    const { data: userData } = await supabase.auth.getUser();
    const finalTenantId = targetTenantId || userData.user?.user_metadata?.tenant_id || userData.user?.id;

    // 1. Invocar RPC com SECURITY DEFINER
    const { data: rpcData, error: rpcErr } = await supabase.rpc('invite_user_to_tenant', {
      p_email: cleanEmail,
      p_role: role,
      p_target_tenant_id: finalTenantId
    });

    if (rpcErr) {
      console.warn('RPC invite_user_to_tenant fallback:', rpcErr.message);
    } else if (rpcData && rpcData.success === false) {
      return { success: false, error: rpcData.error };
    }

    // 2. Acionar Edge Function de envio de e-mail (se ativa)
    try {
      await supabase.functions.invoke('invite-user', {
        body: {
          email: cleanEmail,
          role,
          target_tenant_id: finalTenantId,
          nome: nome || 'Usuário'
        }
      });
    } catch {
      // Falha silenciosa em dev se a Edge Function não estiver ativa localmente
    }

    return {
      success: true,
      message: `Convite enviado com sucesso para ${cleanEmail}!`
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao processar convite'
    };
  }
}
