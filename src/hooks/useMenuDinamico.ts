import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { MenuItemAutorizado, TenantModulo } from '../types/menu.types';

export function useMenuDinamico() {
  const [itensMenu, setItensMenu] = useState<MenuItemAutorizado[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarModulosAutorizados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('tenant_modulos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao consultar permissões de módulos: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setItensMenu([]);
        return;
      }

      const itensMapeados: MenuItemAutorizado[] = (data as TenantModulo[]).map((modulo) => ({
        id: modulo.id,
        moduloChave: modulo.modulo_chave,
        label: modulo.nome_exibicao,
        icone: modulo.icone_chave,
        ordem: modulo.ordem
      }));

      setItensMenu(itensMapeados);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Falha inesperada ao carregar menu';
      setErro(mensagem);
      setItensMenu([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarModulosAutorizados();
  }, [carregarModulosAutorizados]);

  return { itensMenu, carregando, erro, recarregar: carregarModulosAutorizados };
}
