import { supabase } from '../lib/supabase';
import { obterConfigAsaas } from './asaasApiClient';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export interface RegisterEmpresaParams {
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero?: string;
  senha: string;
  planoCodigo: string;
  planoValor: number;
  limiteUsuarios: number;
  billingType?: 'PIX' | 'BOLETO';
}

export interface AsaasOnboardingResult {
  subscriptionId?: string;
  invoiceUrl?: string | null;
  pixQrCode?: string | null;
  pixCopiaCola?: string | null;
  status?: string;
  aviso?: string;
}

export interface RegisterEmpresaResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  asaas?: AsaasOnboardingResult;
}

export async function registerEmpresa(params: RegisterEmpresaParams): Promise<RegisterEmpresaResult> {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanNome = params.razaoSocial.trim();
    const cleanCnpj = params.cnpj.trim();
    const cleanTel = params.telefone.trim();

    if (!cleanEmail || !cleanNome || !params.senha || !cleanCnpj) {
      return { success: false, error: 'Preencha todos os campos obrigatórios (Razão Social, CPF/CNPJ, E-mail e Senha).' };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.senha,
      options: { data: { nome: cleanNome, empresa: cleanNome, role: 'admin', perfil_acesso: 'ADMIN' } }
    });
    if (authError) return { success: false, error: authError.message };

    const userId = authData.user?.id;
    if (!userId) return { success: false, error: 'Não foi possível criar o usuário de acesso.' };

    const enderecoCompleto = `${params.endereco.trim()}${params.numero ? `, ${params.numero.trim()}` : ''}${params.cep ? ` - CEP ${params.cep.trim()}` : ''}`;
    const { data: regData, error: regError } = await supabase.rpc('registrar_tenant_publico', {
      p_user_id: userId, p_nome: cleanNome, p_cnpj: cleanCnpj, p_email: cleanEmail,
      p_telefone: cleanTel || null, p_endereco: enderecoCompleto, p_plano: params.planoCodigo,
      p_valor: params.planoValor, p_limite_usuarios: params.limiteUsuarios || 5
    });
    if (regError || regData?.ok === false) {
      return { success: false, error: `Falha ao registrar a empresa: ${regError?.message || regData?.error}. Execute a migração 66 no Supabase.` };
    }
    const createdTenantId = userId;

    let session = authData.session;
    if (!session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: params.senha });
      session = signInData?.session || null;
    }

    let asaas: AsaasOnboardingResult | undefined;
    if (params.planoValor > 0 && createdTenantId) {
      try {
        const localAsaas = (await obterConfigAsaas(DEFAULT_LEGACY_TENANT)) || (await obterConfigAsaas());
        const resp = await fetch('/api/saas-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({
            action: 'criar_assinatura_recorrente',
            tenantId: createdTenantId,
            plano: params.planoCodigo,
            valor: params.planoValor,
            billingType: params.billingType || 'PIX',
            clientApiKey: localAsaas?.apiKey,
            clientEnvironment: localAsaas?.environment,
            cliente: {
              nome: cleanNome, cpfCnpj: cleanCnpj, email: cleanEmail,
              telefone: cleanTel, cep: params.cep, endereco: params.endereco, numero: params.numero
            }
          })
        });
        const json = await resp.json();
        if (resp.ok && json.success) {
          asaas = {
            subscriptionId: json.subscriptionId,
            invoiceUrl: json.invoiceUrl,
            pixQrCode: json.pixQrCode,
            pixCopiaCola: json.pixCopiaCola,
            status: json.status
          };
        } else {
          asaas = { aviso: json.error || 'Conta criada; conclua a assinatura em Planos e Preços.' };
        }
      } catch {
        asaas = { aviso: 'Conta criada; finalize o pagamento da assinatura no menu Planos e Preços.' };
      }
    }

    return { success: true, requiresEmailConfirmation: !session, asaas };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao registrar empresa' };
  }
}
