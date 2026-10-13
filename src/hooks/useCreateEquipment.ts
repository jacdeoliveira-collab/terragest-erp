import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { localDb } from '../lib/db';
import type { EquipmentCategory, TipoPropriedadeEquipamento, Equipment } from '../types/equipment.types';

export interface NovoEquipamentoInput {
  code: string;
  name: string;
  category: EquipmentCategory;
  type: string;
  marca?: string;
  model: string;
  serial_number: string;
  chassi?: string;
  renavam?: string;
  ano_fabricacao?: number;
  drive_url_foto?: string;
  current_hourmeter?: number;
  placa?: string;
  tipo_propriedade?: TipoPropriedadeEquipamento;
  fornecedor_locacao?: string;
  valor_locacao_mensal?: number;
  valor_aquisicao?: number;
  custo_hora_estimado?: number;
  laudo_art_validade?: string;
  seguro_apolice?: string;
  seguro_validade?: string;
  tag_rastreador?: string;
  combustivel_padrao?: string;
  capacidade_tanque?: number;
  potencia_hp?: number;
}

export function useCreateEquipment() {
  const { tenantAtivoId } = useTenantContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createEquipment = async (input: NovoEquipamentoInput) => {
    if (isSubmitting) return { success: false, error: 'Processando cadastro...' };
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (user?.user_metadata?.tenant_id as string | undefined) || (user?.app_metadata?.tenant_id as string | undefined);

      const fullPayload: any = {
        tenant_id: tenantId || null,
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        category: input.category,
        type: input.type,
        marca: input.marca?.trim() || null,
        model: input.model.trim(),
        serial_number: input.serial_number.trim(),
        chassi: input.chassi?.trim() || null,
        renavam: input.renavam?.trim() || null,
        ano_fabricacao: input.ano_fabricacao ? Number(input.ano_fabricacao) : null,
        drive_url_foto: input.drive_url_foto?.trim() || null,
        current_hourmeter: Number(input.current_hourmeter) || 0,
        placa: input.placa?.trim().toUpperCase() || null,
        tipo_propriedade: input.tipo_propriedade || 'PROPRIO',
        fornecedor_locacao: input.fornecedor_locacao?.trim() || null,
        valor_locacao_mensal: Number(input.valor_locacao_mensal) || 0,
        valor_aquisicao: Number(input.valor_aquisicao) || 0,
        custo_hora_estimado: Number(input.custo_hora_estimado) || 0,
        laudo_art_validade: input.laudo_art_validade || null,
        seguro_apolice: input.seguro_apolice?.trim() || null,
        seguro_validade: input.seguro_validade || null,
        tag_rastreador: input.tag_rastreador?.trim() || null,
        combustivel_padrao: input.combustivel_padrao || 'DIESEL_S10',
        capacidade_tanque: input.capacidade_tanque ? Number(input.capacidade_tanque) : null,
        potencia_hp: input.potencia_hp ? Number(input.potencia_hp) : null,
        status: 'AVAILABLE'
      };

      // 1. Tentar salvar no Supabase com todas as colunas
      let insertResult = await supabase
        .from('equipment')
        .insert([fullPayload])
        .select()
        .single();

      // 2. Blindagem contra colunas ausentes no schema cache do Supabase
      if (insertResult.error && insertResult.error.message.includes('Could not find the')) {
        console.warn('Coluna ausente no Supabase, aplicando fallback com colunas base:', insertResult.error.message);
        
        // Payload básico garantido no schema inicial
        const basePayload: any = {
          tenant_id: tenantId || null,
          code: input.code.trim().toUpperCase(),
          name: input.name.trim(),
          category: input.category,
          type: input.type,
          model: input.model.trim(),
          serial_number: input.serial_number.trim(),
          current_hourmeter: Number(input.current_hourmeter) || 0,
          status: 'AVAILABLE'
        };

        insertResult = await supabase
          .from('equipment')
          .insert([basePayload])
          .select()
          .single();
      }

      // Se mesmo o básico falhar ou der erro de rede, gera um ID local e salva
      let finalEquip: Equipment;
      if (insertResult.data) {
        finalEquip = { ...fullPayload, id: insertResult.data.id } as Equipment;
      } else {
        const localId = crypto.randomUUID ? crypto.randomUUID() : 'eq_' + Date.now();
        finalEquip = { ...fullPayload, id: localId } as Equipment;
      }

      // 3. Salvar no cache local Dexie e localStorage para garantir que NENHUM dado (ano, chassi, renavam) seja perdido
      try {
        await localDb.equipment.put(finalEquip);
      } catch {}

      try {
        const key = 'terragest_local_equipments';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = Array.isArray(existing) ? existing.filter((e: any) => e.code !== finalEquip.code && e.id !== finalEquip.id) : [];
        filtered.unshift(finalEquip);
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch {}

      return { success: true, data: finalEquip };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar equipamento';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createEquipment,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
