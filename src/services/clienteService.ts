import { supabase } from '../lib/supabase';
import type { Cliente } from '../types/comercial.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export async function fetchClientesApi(tenantId?: string): Promise<Cliente[]> {
  try {
    let query = supabase.from('clientes').select('*').order('nome', { ascending: true });
    query = aplicarFiltroTenant(query, tenantId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as Cliente[];
  } catch {
    return [];
  }
}

export async function insertClienteApi(cliente: Cliente): Promise<Cliente | null> {
  const activeTenant = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
  const payload = {
    id: cliente.id,
    tenant_id: cliente.tenant_id || activeTenant || DEFAULT_LEGACY_TENANT,
    nome: cliente.nome,
    documento: cliente.documento || null,
    telefone: cliente.telefone || null,
    endereco: cliente.endereco || null,
    email: cliente.email || null,
    created_at: cliente.created_at || new Date().toISOString(),
    updated_at: cliente.updated_at || new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('clientes').upsert([payload]).select();
    if (!error && data && data.length > 0) return data[0] as Cliente;
  } catch (e) {
    console.warn('[clienteService] Erro ao inserir cliente:', e);
  }
  return cliente;
}

export async function updateClienteApi(cliente: Cliente): Promise<Cliente | null> {
  const activeTenant = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
  const payload = {
    id: cliente.id,
    tenant_id: cliente.tenant_id || activeTenant || DEFAULT_LEGACY_TENANT,
    nome: cliente.nome,
    documento: cliente.documento || null,
    telefone: cliente.telefone || null,
    endereco: cliente.endereco || null,
    email: cliente.email || null,
    updated_at: new Date().toISOString()
  };

  try {
    // 1. Tenta update direto
    const { data, error } = await supabase
      .from('clientes')
      .update(payload)
      .eq('id', cliente.id)
      .select();

    if (!error && data && data.length > 0) return data[0] as Cliente;

    // 2. Se falhar ou não achar a linha pelo id, usa upsert
    const upRes = await supabase.from('clientes').upsert([payload]).select();
    if (!upRes.error && upRes.data && upRes.data.length > 0) {
      return upRes.data[0] as Cliente;
    }
  } catch (e) {
    console.warn('[clienteService] Erro ao atualizar cliente:', e);
  }
  return cliente;
}

export async function deleteClienteApi(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Mescla registros com nomes idênticos combinando telefone, endereço e documento,
 * ignorando valores vazios ou traços ('-').
 */
export function desduplicarListaClientes(lista: Cliente[]): Cliente[] {
  const map = new Map<string, Cliente>();

  for (const c of lista) {
    const chave = (c.nome || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!chave) continue;

    const existente = map.get(chave);
    if (!existente) {
      map.set(chave, c);
    } else {
      const getVal = (v1?: string, v2?: string) => {
        const val1 = v1?.trim();
        if (val1 && val1 !== '-') return val1;
        const val2 = v2?.trim();
        if (val2 && val2 !== '-') return val2;
        return undefined;
      };

      map.set(chave, {
        id: existente.id || c.id,
        tenant_id: existente.tenant_id || c.tenant_id,
        nome: (existente.nome || '').length >= (c.nome || '').length ? existente.nome : c.nome,
        documento: getVal(existente.documento, c.documento),
        telefone: getVal(existente.telefone, c.telefone),
        endereco: getVal(existente.endereco, c.endereco),
        email: getVal(existente.email, c.email),
        created_at: existente.created_at || c.created_at,
        updated_at: new Date().toISOString()
      });
    }
  }

  return Array.from(map.values());
}
