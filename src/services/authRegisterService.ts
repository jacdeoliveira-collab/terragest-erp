import { supabase } from '../lib/supabase';

export interface RegisterEmpresaParams {
  razaoSocial: string;
  cnpj?: string;
  email: string;
  senha: string;
}

export interface RegisterEmpresaResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

export async function registerEmpresa({
  razaoSocial,
  cnpj,
  email,
  senha
}: RegisterEmpresaParams): Promise<RegisterEmpresaResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanNome = razaoSocial.trim();
    const cleanCnpj = cnpj?.trim() || null;

    if (!cleanEmail || !cleanNome || !senha) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    // Datas do período de teste / assinatura inicial (15 dias de avaliação)
    const hoje = new Date();
    const dataInicio = hoje.toISOString().slice(0, 10);
    const dataFimObj = new Date(hoje);
    dataFimObj.setDate(dataFimObj.getDate() + 15);
    const dataFim = dataFimObj.toISOString().slice(0, 10);

    // 1. Criar usuário com metadata contendo dados da empresa
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: senha,
      options: {
        data: {
          nome: cleanNome,
          empresa: cleanNome,
          role: 'admin'
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;

    // 2. Inserir a nova empresa na tabela tenants
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert([{
        id: userId,
        nome: cleanNome,
        cnpj: cleanCnpj,
        admin_email: cleanEmail,
        contato_email: cleanEmail,
        plano: 'START',
        status_conta: 'ativo',
        assinatura_inicio: dataInicio,
        assinatura_fim: dataFim,
        limite_usuarios: 5,
        valor_mensalidade: 1200,
        plano_valor: 1200
      }])
      .select()
      .single();

    if (tenantError) {
      // Se falhar por PK duplicada ou trigger, tenta sem forçar ID
      const { error: fallbackError } = await supabase
        .from('tenants')
        .insert([{
          nome: cleanNome,
          cnpj: cleanCnpj,
          admin_email: cleanEmail,
          contato_email: cleanEmail,
          plano: 'START',
          status_conta: 'ativo',
          assinatura_inicio: dataInicio,
          assinatura_fim: dataFim,
          limite_usuarios: 5,
          valor_mensalidade: 1200,
          plano_valor: 1200
        }]);

      if (fallbackError) {
        console.warn('Registro de tenant fallback warning:', fallbackError.message);
      }
    }

    let requiresEmailConfirmation = !authData.session;

    // Se não tiver sessão (ex: em algumas configurações do Supabase), tentar login imediato
    if (!authData.session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: senha
      });
      if (signInData?.session) {
        requiresEmailConfirmation = false;
      }
    }

    return {
      success: true,
      requiresEmailConfirmation
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao registrar empresa'
    };
  }
}
