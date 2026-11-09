import React, { useState, useEffect } from 'react';
import { Fuel, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAbastecimentos } from '../../../../hooks/useAbastecimentos';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { supabase } from '../../../../lib/supabase';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';
import { sincronizarDespesa, removerDespesaPorRef } from '../../../../services/contasPagarSyncHelper';
import { formatarTagEmprestimo } from '../../../../utils/emprestimoHelper';
import { AbastecimentoRapidoForm, type NovoAbastecimentoRapidoDTO } from './AbastecimentoRapidoForm';
import { AbastecimentosListRows } from './AbastecimentosListRows';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';

interface Props {
  maquinaNome?: string; servicoId?: string; clienteId?: string; clienteNome?: string;
  abastecimentosIds?: string[]; setAbastecimentosIds?: (ids: string[]) => void;
  onTotaisChange: (maqL: number, maqV: number, apoioL: number, apoioV: number, foto?: string) => void;
}

export const AbastecimentosHistoricoSection: React.FC<Props> = ({
  maquinaNome, servicoId, clienteId, clienteNome, abastecimentosIds = [], setAbastecimentosIds, onTotaisChange
}) => {
  const { tenantAtivoId } = useTenantContext();
  const { data: todosAbast, refetch } = useAbastecimentos();
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [itemEmEdicao, setItemEmEdicao] = useState<AbastecimentoItem | null>(null);

  useEffect(() => { refetch(); }, [refetch]);

  const itensVinculados = (todosAbast || []).filter((a) =>
    abastecimentosIds.includes(a.id) || (servicoId ? (a.servico_id === servicoId || a.numero_requisicao_nf?.includes(servicoId)) : false)
  );

  const calcularResumo = (lista: AbastecimentoItem[]) => {
    let [mL, mV, aL, aV] = [0, 0, 0, 0];
    let foto: string | undefined;
    lista.forEach((ab) => {
      const isApoio = isVehicleOrTruck({ code: ab.maquina_codigo, name: ab.maquina_nome }) || ab.tipo_combustivel === 'DIESEL_S10';
      const lit = Number(ab.quantidade_litros) || 0, val = Number(ab.valor_total) || 0;
      if (isApoio) { aL += lit; aV += val; } else { mL += lit; mV += val; }
      if (ab.foto_comprovante && !foto) foto = ab.foto_comprovante;
    });
    return { mLit: Number(mL.toFixed(2)), mVal: Number(mV.toFixed(2)), aLit: Number(aL.toFixed(2)), aVal: Number(aV.toFixed(2)), foto };
  };

  useEffect(() => {
    if (itensVinculados.length > 0) {
      const { mLit, mVal, aLit, aVal, foto } = calcularResumo(itensVinculados);
      onTotaisChange(mLit, mVal, aLit, aVal, foto);
    }
  }, [todosAbast, servicoId]);

  const atualizarServicoTotais = async (lista: AbastecimentoItem[], novosIds: string[]) => {
    const { mLit, mVal, aLit, aVal, foto } = calcularResumo(lista);
    onTotaisChange(mLit, mVal, aLit, aVal, foto);
    if (setAbastecimentosIds) setAbastecimentosIds(novosIds);
    if (servicoId) {
      await supabase.from('servicos_horimetro').update({
        combustivel_maquina_litros: mLit, combustivel_maquina_valor: mVal,
        combustivel_apoio_litros: aLit, combustivel_apoio_valor: aVal,
        combustivel_total_valor: Number((mVal + aVal).toFixed(2)), abastecimentos_ids: novosIds
      }).eq('id', servicoId);
    }
  };

  const handleAdicionar = async (dto: NovoAbastecimentoRapidoDTO): Promise<boolean> => {
    try {
      setSalvando(true); setErroMsg(null);
      const obraPadrao = 'a1aa1351-5e2e-4b9d-b5b9-3bd7cec521b1';
      const fotoSegura = dto.foto_comprovante && !dto.foto_comprovante.startsWith('data:') ? dto.foto_comprovante : null;
      const tagEmp = dto.emprestimo ? `${formatarTagEmprestimo(dto.emprestimo)} ` : '';
      const refItem = servicoId ? `Cupom [ITEM:${servicoId.slice(0, 8)}:${Date.now().toString(36)}]` : 'Cupom Avulso';

      const novoAbast = {
        tenant_id: tenantAtivoId, obra_id: obraPadrao, maquina_id: dto.maquina_id, equipment_id: dto.maquina_id,
        data: dto.data, tipo_combustivel: dto.tipo_combustivel, quantidade_litros: dto.quantidade_litros,
        valor_unitario: dto.valor_unitario, valor_total: dto.valor_total, horimetro_momento: dto.horimetro_momento || 0,
        posto_fornecedor: dto.posto_fornecedor, numero_requisicao_nf: `${tagEmp}${refItem}`, foto_comprovante: fotoSegura,
        servico_id: servicoId || null, cliente_id: clienteId || null, cliente_nome: clienteNome || null, origem: 'POSTO'
      };
      const { data: criado, error } = await supabase.from('abastecimentos').insert([novoAbast]).select().single();
      if (error || !criado) throw error || new Error('Falha ao gravar abastecimento');

      await sincronizarDespesa({
        ref: `ABAST_${criado.id}`, categoria: 'COMBUSTIVEL', tenantId: tenantAtivoId, obraId: obraPadrao,
        descricao: `Diesel ${dto.maquina_nome}: ${dto.quantidade_litros}L (${clienteNome || 'Serviço'})`,
        fornecedor: dto.emprestimo ? `${dto.emprestimo.credorNome} (${dto.posto_fornecedor || 'Posto'})` : (dto.posto_fornecedor || 'Posto'),
        valor: dto.valor_total, dataVencimento: dto.emprestimo?.dataPagamentoPrevista || dto.data,
        formaPagamento: dto.forma_pagamento || 'PIX', status: dto.emprestimo || dto.forma_pagamento === 'BOLETO' ? 'PENDENTE' : 'PAGO',
        observacoes: `${tagEmp}Abastecimento vinculado ao serviço ${clienteNome || ''}`
      });

      const novosIds = Array.from(new Set([...itensVinculados.map((i) => i.id), criado.id]));
      await atualizarServicoTotais([...itensVinculados, criado as AbastecimentoItem], novosIds);
      await refetch();
      setMensagem(`Abastecimento de ${dto.quantidade_litros}L registrado!`);
      setTimeout(() => setMensagem(null), 3000);
      return true;
    } catch (err: unknown) {
      setErroMsg(err instanceof Error ? err.message : 'Erro ao gravar abastecimento'); return false;
    } finally { setSalvando(false); }
  };

  const handleSalvarEdicao = async (id: string, dto: NovoAbastecimentoRapidoDTO): Promise<boolean> => {
    try {
      setSalvando(true); setErroMsg(null);
      const obraPadrao = 'a1aa1351-5e2e-4b9d-b5b9-3bd7cec521b1';
      const fotoSegura = dto.foto_comprovante && !dto.foto_comprovante.startsWith('data:') ? dto.foto_comprovante : null;
      await supabase.from('abastecimentos').update({
        maquina_id: dto.maquina_id, equipment_id: dto.maquina_id, data: dto.data,
        tipo_combustivel: dto.tipo_combustivel, quantidade_litros: dto.quantidade_litros,
        valor_unitario: dto.valor_unitario, valor_total: dto.valor_total,
        horimetro_momento: dto.horimetro_momento || 0, posto_fornecedor: dto.posto_fornecedor,
        foto_comprovante: fotoSegura
      }).eq('id', id);

      await sincronizarDespesa({
        ref: `ABAST_${id}`, categoria: 'COMBUSTIVEL', tenantId: tenantAtivoId, obraId: obraPadrao,
        descricao: `Diesel ${dto.maquina_nome}: ${dto.quantidade_litros}L (${clienteNome || 'Serviço'})`,
        fornecedor: dto.posto_fornecedor || 'Posto', valor: dto.valor_total, dataVencimento: dto.data,
        formaPagamento: dto.forma_pagamento || 'PIX', status: 'PAGO'
      });
      setItemEmEdicao(null);
      await refetch();
      setMensagem('Abastecimento atualizado com sucesso!');
      setTimeout(() => setMensagem(null), 3000);
      return true;
    } catch (err: unknown) { setErroMsg(err instanceof Error ? err.message : 'Erro ao atualizar'); return false; }
    finally { setSalvando(false); }
  };

  const handleRemover = async (id: string) => {
    try {
      setSalvando(true); setErroMsg(null);
      if (itemEmEdicao?.id === id) setItemEmEdicao(null);
      await Promise.all([supabase.from('abastecimentos').delete().eq('id', id), removerDespesaPorRef(`ABAST_${id}`)]);
      const novaLista = itensVinculados.filter((x) => x.id !== id);
      await atualizarServicoTotais(novaLista, novaLista.map((x) => x.id));
      await refetch();
    } catch (err: unknown) { setErroMsg(err instanceof Error ? err.message : 'Erro ao remover'); } finally { setSalvando(false); }
  };

  const totalLitros = itensVinculados.reduce((acc, i) => acc + (Number(i.quantidade_litros) || 0), 0);
  const totalValor = itensVinculados.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0);

  return (
    <div className="p-3.5 bg-amber-50/60 border border-amber-300 rounded-xl space-y-3 text-left text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase tracking-wider">
          <Fuel className="w-4 h-4 text-amber-600" />
          <span>Histórico de Abastecimentos ({itensVinculados.length})</span>
        </div>
        <div className="text-right font-mono">
          <span className="text-gray-600 mr-2">{totalLitros.toFixed(2)} L</span>
          <span className="text-amber-900 font-bold">R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      <AbastecimentoRapidoForm maquinaServicoNome={maquinaNome} onAdicionar={handleAdicionar} itemEmEdicao={itemEmEdicao} onSalvarEdicao={handleSalvarEdicao} onCancelarEdicao={() => setItemEmEdicao(null)} carregando={salvando} />
      {erroMsg && <div className="p-2 bg-rose-100 border border-rose-300 text-rose-900 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold"><AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" /><span>{erroMsg}</span></div>}
      {mensagem && <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" /><span>{mensagem}</span></div>}
      {itensVinculados.length > 0 && <AbastecimentosListRows itens={itensVinculados} onRemover={handleRemover} onEditar={(it) => setItemEmEdicao(it)} editandoId={itemEmEdicao?.id} carregando={salvando} />}
    </div>
  );
};
