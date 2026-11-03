import { supabase } from '../lib/supabase';
import type { ContaBancaria } from '../types/contaBancaria.types';

const criandoCaixaPorTenant = new Map<string, Promise<ContaBancaria | null>>();

export function isContaCaixaFisico(c?: ContaBancaria | null): boolean {
  if (!c) return false;
  if (c.tipo_conta === 'CAIXA_FISICO') return true;
  const nome = (c.nome_conta || '').toUpperCase().trim();
  const txt = `${nome} ${(c.banco || '').toUpperCase()}`;
  if (/DINHEIRO|ESPECIE|ESPÉCIE|CAIXA F[IÍ]SICO|CAIXA INTERNO/.test(txt)) return true;
  return nome.startsWith('CAIXA') && !/ECON[OÔ]MICA|FEDERAL/.test(txt);
}

/** Garante (uma única vez por tenant) a existência da conta Caixa Físico (dinheiro em mãos). */
export async function garantirCaixaFisico(lista: ContaBancaria[], tenantId?: string): Promise<ContaBancaria[]> {
  if (lista.some((c) => isContaCaixaFisico(c))) return lista;
  const chave = tenantId || 'GLOBAL';
  if (!criandoCaixaPorTenant.has(chave)) {
    criandoCaixaPorTenant.set(chave, (async () => {
      const { data } = await supabase.from('contas_bancarias').insert([{
        tenant_id: tenantId || null,
        nome_conta: 'Caixa Físico (Dinheiro em Mãos)',
        banco: 'Caixa Interno / Espécie',
        tipo_conta: 'CAIXA_FISICO',
        titular: 'Caixa Geral da Empresa',
        saldo_inicial: 0,
        is_padrao: lista.length === 0,
        ativo: true
      }]).select('*').maybeSingle();
      return (data as ContaBancaria) || null;
    })());
  }
  const novo = await criandoCaixaPorTenant.get(chave)!;
  return novo && !lista.some((c) => c.id === novo.id) ? [...lista, novo] : lista;
}

