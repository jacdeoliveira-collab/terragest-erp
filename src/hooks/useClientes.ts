import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '../types/comercial.types';
import {
  getCachedClientes, saveCachedClientes,
  getDeletedClienteIds, addDeletedClienteId
} from '../services/clienteStorage';
import {
  fetchClientesApi,
  insertClienteApi,
  updateClienteApi,
  deleteClienteApi,
  desduplicarListaClientes
} from '../services/clienteService';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export function useClientes() {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const cached = getCachedClientes(activeTenant);
    const deleted = getDeletedClienteIds(activeTenant);
    return desduplicarListaClientes(cached.filter((c) => !deleted.has(c.id)));
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedClientes(activeTenant);
    const deleted = getDeletedClienteIds(activeTenant);
    setClientes(desduplicarListaClientes(cached.filter((c) => !deleted.has(c.id))));
  }, [activeTenant]);

  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const cached = getCachedClientes(currentTenant);
      const deleted = getDeletedClienteIds(currentTenant);
      const cachedValidos = desduplicarListaClientes(cached.filter((c) => !deleted.has(c.id)));
      if (cachedValidos.length > 0) setClientes(cachedValidos);

      const remoteData = await fetchClientesApi(currentTenant);
      const remoteValidos = remoteData.filter((r) => !deleted.has(r.id));

      const merged = desduplicarListaClientes([...cachedValidos, ...remoteValidos]);
      setClientes(merged);
      saveCachedClientes(merged, currentTenant);
    } catch (err: unknown) {
      console.warn('[useClientes] Erro ao sincronizar clientes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId]);

  const criarCliente = async (dto: CreateClienteDTO) => {
    const { data: userData } = await supabase.auth.getUser();
    const tenantId = tenantAtivoId || userData?.user?.user_metadata?.tenant_id || userData?.user?.id;

    const novoCliente: Cliente = {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      nome: dto.nome.trim(),
      documento: dto.documento?.trim() || undefined,
      telefone: dto.telefone?.trim() || undefined,
      endereco: dto.endereco?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const current = getCachedClientes(activeTenant).filter((c) => c.id !== novoCliente.id && c.nome !== novoCliente.nome);
    const updated = [novoCliente, ...current];
    saveCachedClientes(updated, activeTenant);
    setClientes(updated);

    const saved = await insertClienteApi(novoCliente);
    if (saved) {
      const finalUpdated = [saved, ...current];
      saveCachedClientes(finalUpdated, activeTenant);
      setClientes(finalUpdated);
    }
    return { success: true, data: novoCliente };
  };

  const atualizarCliente = async (id: string, dto: UpdateClienteDTO) => {
    const current = getCachedClientes(activeTenant);
    const index = current.findIndex((c) => c.id === id);
    const alvo = index >= 0 ? current[index] : clientes.find((c) => c.id === id);
    if (!alvo) return { success: false, error: 'Cliente não encontrado' };

    const atualizado: Cliente = {
      ...alvo,
      nome: dto.nome !== undefined ? dto.nome.trim() : alvo.nome,
      documento: dto.documento !== undefined ? (dto.documento.trim() || undefined) : alvo.documento,
      telefone: dto.telefone !== undefined ? (dto.telefone.trim() || undefined) : alvo.telefone,
      endereco: dto.endereco !== undefined ? (dto.endereco.trim() || undefined) : alvo.endereco,
      email: dto.email !== undefined ? (dto.email.trim() || undefined) : alvo.email,
      updated_at: new Date().toISOString()
    };

    const updatedList = current.map((c) => (c.id === id ? atualizado : c));
    saveCachedClientes(updatedList, activeTenant);
    setClientes(updatedList);

    const synced = await updateClienteApi(atualizado);
    if (synced) {
      const finalUpdated = updatedList.map((c) => (c.id === id ? synced : c));
      saveCachedClientes(finalUpdated, activeTenant);
      setClientes(finalUpdated);
    }
    return { success: true, data: atualizado };
  };

  const excluirCliente = async (id: string) => {
    addDeletedClienteId(id, activeTenant);
    const current = getCachedClientes(activeTenant).filter((c) => c.id !== id);
    saveCachedClientes(current, activeTenant);
    setClientes(current);
    await deleteClienteApi(id);
    return { success: true };
  };

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return { clientes, isLoading, error, refetch: fetchClientes, criarCliente, atualizarCliente, excluirCliente };
}
