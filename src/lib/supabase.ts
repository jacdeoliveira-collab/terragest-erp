import { criarClienteSupabaseProtegido } from './supabaseGuard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ]
    .filter(Boolean)
    .join(', ');

  const errorMessage = `[Supabase Error] Configuração incompleta. Variável(is) ausente(s): ${missingVars}. Verifique o arquivo .env.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const isSupabaseConfigured = true;

export const supabase = criarClienteSupabaseProtegido(supabaseUrl, supabaseAnonKey);
