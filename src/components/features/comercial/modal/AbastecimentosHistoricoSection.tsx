import React, { useState } from 'react';
import { Fuel, CheckCircle2 } from 'lucide-react';
import { useAbastecimentos } from '../../../../hooks/useAbastecimentos';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { supabase } from '../../../../lib/supabase';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';
import { AbastecimentoRapidoForm, type NovoAbastecimentoRapidoDTO } from './AbastecimentoRapidoForm';
import { AbastecimentosListRows } from './AbastecimentosListRows';
import { AbastecimentosVinculadosSelector } from './AbastecimentosVinculadosSelector';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';

interface Props {
  maquinaNome?: string;
  servicoId?: string;
  clienteId?: string;
  clienteNome?: string;
  abastecimentosIds?: string[];
  setAbastecimentosIds?: (ids: string[]) => void;
  onTotaisChange: (maqL: number, maqV: number, apoioL: number, apoioV: number, foto?: string) => void;
}

export const AbastecimentosHistoricoSection: React.FC<Props> = ({
  maquinaNome, servicoId, clienteId, clienteNome,
  abastecimentosIds = [], setAbastecimentosIds, onTotaisChange
}) => {
  const { tenantAtivoId } = useTenantContext();
  const { data: todosAbast, refetch } = useAbastecimentos();
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // Filtra itens vinculados a este serviço
  const itensVinculados = (todosAbast || []).filter((a) => {
    if (abastecimentosIds.includes(a.id)) return true;
    if (servicoId && (a.servico_id === servicoId || a.numero_requisicao_nf?.includes(servicoId))) return true;
    return false;
  });

  const recalcularTotais = (lista: AbastecimentoItem[], novosIds: string[]) => {
    let [mL, mV, aL, aV] = [0, 0, 0, 0];
    let foto: string | undefined;

    lista.forEach((ab) => {
      const isApoio = isVehicleOrTruck({ code: ab.maquina_codigo, name: ab.maquina_nome }) || ab.tipo_combustivel === 'DIESEL_S10';
      const lit = Number(ab.quantidade_litros) || 0;
      const val = Number(ab.valor_total) || 0;
      if (isApoio) { aL += lit; aV += val; } else { mL += lit; mV += val; }
      if (ab.foto_comprovante && !foto) foto = ab.foto_comprovante;
    });

    onTotaisChange(Number(mL.toFixed(2)), Number(mV.toFixed(2)), Number(aL.toFixed(2)), Number(aV.toFixed(2)), foto);
    if (setAbastecimentosIds) setAbastecimentosIds(novosIds);
  };

  const handleAdicionar = async (dto: NovoAbastecimentoRapidoDTO) => {
    try {
      setSalvando(true);
      const isMaq = dto.tipo_alvo === 'MAQUINA';
      const maqPadraoId = '40d4e2f6-bb01-4898-8660-e5646a2d1a08'; // EH-001
      const apoioPadraoId = '021f824a-4f94-4d4a-9f5c-97a6cc8bf0ee'; // Hilux EQ-3125

      const novoAbast = {
        tenant_id: tenantAtivoId, obra_id: 'a1aa1351-5e2e-4b9d-b5b9-3bd7cec521b1',
        maquina_id: isMaq ? maqPadraoId : apoioPadraoId, equipment_id: isMaq ? maqPadraoId : apoioPadraoId,
        data: dto.data, tipo_combustivel: isMaq ? 'DIESEL_S500' : 'DIESEL_S10',
        quantidade_litros: dto.quantidade_litros, valor_total: dto.valor_total,
        horimetro_momento: dto.horimetro_momento || 0, posto_fornecedor: dto.posto_fornecedor,
        numero_requisicao_nf: servicoId ? `Cupom [REF:${servicoId}:${isMaq ? 'MAQ' : 'APOIO'}]` : 'Cupom Avulso',
        foto_comprovante: dto.foto_comprovante || null,
        servico_id: servicoId || null, cliente_id: clienteId || null, cliente_nome: clienteNome || null, origem: 'POSTO'
      };

      const { data: criado, error } = await supabase.from('abastecimentos').insert([novoAbast]).select().single();
      if (error || !criado) throw error || new Error('Falha ao cadastrar');

      const novosIds = [...abastecimentosIds, criado.id];
      const novaLista = [...itensVinculados, criado as AbastecimentoItem];
      recalcularTotais(novaLista, novosIds);
      await refetch();

      setMensagem('Abastecimento adicionado com sucesso!');
      setTimeout(() => setMensagem(null), 3000);
    } catch (err) {
      console.error('Erro ao adicionar abastecimento:', err);
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id: string) => {
    try {
      setSalvando(true);
      await supabase.from('abastecimentos').update({ servico_id: null }).eq('id', id);
      const novosIds = abastecimentosIds.filter((x) => x !== id);
      const novaLista = itensVinculados.filter((x) => x.id !== id);
      recalcularTotais(novaLista, novosIds);
      await refetch();
    } catch (err) {
      console.error('Erro ao desvincular abastecimento:', err);
    } finally {
      setSalvando(false);
    }
  };

  const totalLitros = itensVinculados.reduce((acc, i) => acc + (Number(i.quantidade_litros) || 0), 0);
  const totalValor = itensVinculados.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0);

  return (
    <div className="p-3.5 bg-amber-50/60 border border-amber-300 rounded-xl space-y-3 text-left text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase tracking-wider">
          <Fuel className="w-4 h-4 text-amber-600" />
          <span>Histórico de Abastecimentos do Serviço ({itensVinculados.length})</span>
        </div>
        <div className="text-right font-mono">
          <span className="text-gray-600 mr-2">{totalLitros.toFixed(1)} L</span>
          <span className="text-amber-900 font-bold">R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <AbastecimentoRapidoForm onAdicionar={handleAdicionar} carregando={salvando} />

      {mensagem && (
        <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>{mensagem}</span>
        </div>
      )}

      {itensVinculados.length > 0 && (
        <AbastecimentosListRows itens={itensVinculados} onRemover={handleRemover} carregando={salvando} />
      )}

      <AbastecimentosVinculadosSelector
        maquinaNome={maquinaNome} servicoId={servicoId} abastecimentosIds={abastecimentosIds}
        onAplicar={(mL, mV, aL, aV, foto, ids) => {
          onTotaisChange(mL, mV, aL, aV, foto);
          if (ids && setAbastecimentosIds) setAbastecimentosIds(ids);
        }}
      />
    </div>
  );
};
