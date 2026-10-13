import { supabase } from '../lib/supabase';

/**
 * Consulta a tabela `super_admins` para verificar se o auth.uid() fornecido
 * possui privilégios de Super Admin.
 * 
 * @param uid UUID do usuário logado
 * @returns Promise<boolean> true se for super admin, false caso contrário
 */
export async function isUserSuperAdmin(uid?: string | null): Promise<boolean> {
  if (!uid) return false;

  try {
    const { data, error } = await supabase
      .from('super_admins')
      .select('id')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('[adminService] Erro ao checar super admin:', error.message);
      return false;
    }

    return Boolean(data);
  } catch (err: unknown) {
    console.warn('[adminService] Falha inesperada ao consultar super_admins:', err);
    return false;
  }
}

/**
 * Verifica se um e-mail é o e-mail master/criador da plataforma TerraGest.
 * Utiliza variável de ambiente VITE_MASTER_EMAIL com fallback para e-mails do criador.
 */
export function isMasterEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const masterEnv = (import.meta.env.VITE_MASTER_EMAIL || '').toLowerCase().trim();
  if (masterEnv && clean === masterEnv) return true;
  return clean === 'asteriobello@hotmail.com' || clean === 'master@terragest.com';
}

