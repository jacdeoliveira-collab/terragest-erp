import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';
import type { TenantMaster } from '../../types/tenant.types';
import { supabase } from '../../lib/supabase';
import { getEmpresaAtivaCache } from '../../services/empresaAtivaService';
import { obterLogoEmpresa, obterAssinaturaEmpresa } from './pdfLogoHelper';
import { prepararImagemParaPdf } from './pdfImageHelper';

export interface DadosClientePdf {
  documento?: string;
  telefone?: string;
  endereco?: string;
}

export async function buscarContaServico(contaId?: string) {
  if (!contaId) return null;
  try {
    const { data } = await supabase
      .from('contas_bancarias')
      .select('nome_conta, banco, titular, chave_pix')
      .eq('id', contaId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function buscarDadosClienteServico(
  clienteId?: string,
  clienteNome?: string
): Promise<DadosClientePdf | null> {
  try {
    if (clienteId) {
      const { data } = await supabase
        .from('clientes')
        .select('documento, telefone, endereco')
        .eq('id', clienteId)
        .maybeSingle();
      if (data) return data;
    }
    if (clienteNome?.trim()) {
      const { data } = await supabase
        .from('clientes')
        .select('documento, telefone, endereco')
        .ilike('nome', clienteNome.trim())
        .limit(1)
        .maybeSingle();
      if (data) return data;
    }
  } catch {}
  return null;
}

export async function prepararEmpresaComLogoParaPdf(): Promise<Partial<TenantMaster>> {
  const empresa = { ...(getEmpresaAtivaCache() || {}) };
  const logoSrc = obterLogoEmpresa(empresa);
  const assSrc = obterAssinaturaEmpresa(empresa);

  const [logoBase64, assBase64] = await Promise.all([
    logoSrc ? prepararImagemParaPdf(logoSrc) : Promise.resolve(null),
    assSrc ? prepararImagemParaPdf(assSrc) : Promise.resolve(null)
  ]);

  if (logoBase64) empresa.logo_url = logoBase64;
  if (assBase64) empresa.assinatura_digital_url = assBase64;
  return empresa;
}

/**
 * Garante que os dados mais completos do serviço (como fotos e parcelas)
 * sejam recuperados mesmo se o item em tela estiver parcialmente preenchido.
 */
export function obterServicoCompleto(servico: ServicoHorimetro): ServicoHorimetro {
  try {
    const raw = localStorage.getItem('terragest_servicos_horimetro');
    if (raw) {
      const list = JSON.parse(raw) as ServicoHorimetro[];
      const match = list.find((s) => s.id === servico.id);
      if (match) {
        return {
          ...match,
          ...servico,
          foto_horimetro_inicial: servico.foto_horimetro_inicial || match.foto_horimetro_inicial,
          foto_horimetro_final: servico.foto_horimetro_final || match.foto_horimetro_final,
          fotos_trabalho: (servico.fotos_trabalho && servico.fotos_trabalho.length > 0)
            ? servico.fotos_trabalho
            : (match.fotos_trabalho || []),
          horimetro_inicial: servico.horimetro_inicial ?? match.horimetro_inicial,
          horimetro_final: servico.horimetro_final ?? match.horimetro_final
        };
      }
    }
  } catch {}
  return servico;
}
