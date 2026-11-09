import React, { useState, useEffect } from 'react';
import { Table } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { PecasManutencaoForm } from './PecasManutencaoForm';
import { PecasManutencaoListRows } from './PecasManutencaoListRows';
import { salvarItemManutencaoCompleto, excluirItemManutencaoCompleto } from '../../../../services/servicoManutencaoSyncHelper';
import type { DespesaItemServico } from '../../../../types/servicoHorimetro.types';

interface Props {
  servicoId?: string;
  clienteNome?: string;
  maquinaId?: string;
  maquinaNome?: string;
  obraId?: string;
  dataPadrao?: string;
  initialTotal?: number;
  initialItens?: DespesaItemServico[];
  onTotalChange: (total: number, itens: DespesaItemServico[]) => void;
}

export const PecasManutencaoHistoricoSection: React.FC<Props> = ({
  servicoId, clienteNome, maquinaId, maquinaNome, obraId, dataPadrao,
  initialTotal = 0, initialItens = [], onTotalChange
}) => {
  const { tenantAtivoId } = useTenantContext();
  const [itens, setItens] = useState<DespesaItemServico[]>(initialItens);
  const [carregando, setCarregando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [itemEmEdicao, setItemEmEdicao] = useState<DespesaItemServico | null>(null);

  useEffect(() => {
    if (!servicoId) {
      if (initialItens.length > 0) setItens(initialItens);
      return;
    }
    const carregar = async () => {
      setCarregando(true);
      const { data: cps } = await supabase
        .from('contas_pagar').select('*')
        .eq('categoria', 'PECAS_MANUTENCAO')
        .ilike('observacoes', `%[REF:${servicoId}]%`)
        .order('data_vencimento', { ascending: true });

      if (cps && cps.length > 0) {
        const temItensDetalhados = cps.some((c) => c.observacoes?.includes('[DESP_MANUT:'));
        const filtrados = temItensDetalhados ? cps.filter((c) => !c.observacoes?.includes('[CAT:MANUTENCAO]')) : cps;
        const mapeados: DespesaItemServico[] = filtrados.map((c) => {
          const matchId = c.observacoes?.match(/\[DESP_MANUT:([^\]]+)\]/);
          const matchComp = c.observacoes?.match(/Comprovante:\s*([^\s|]+)/);
          return {
            id: matchId ? matchId[1] : c.id,
            categoria: 'PECAS_LUBRIFICANTES',
            descricao: c.descricao.split(' - ')[0] || c.descricao,
            fornecedor: c.fornecedor,
            valor: Number(c.valor) || 0,
            data: c.data_vencimento || dataPadrao || new Date().toISOString().slice(0, 10),
            forma_pagamento: c.forma_pagamento || 'PIX',
            status_pagamento: c.status === 'PAGO' ? 'PAGO' : 'PENDENTE',
            comprovante_url: matchComp && matchComp[1] !== 'Nenhum' ? matchComp[1] : undefined
          };
        });
        setItens(mapeados);
        const soma = Number(mapeados.reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2));
        onTotalChange(soma, mapeados);
      } else if (initialItens.length > 0) {
        setItens(initialItens);
      }
      setCarregando(false);
    };
    carregar();
  }, [servicoId]);

  const recalcularEAtualizar = async (novaLista: DespesaItemServico[]) => {
    setItens(novaLista);
    const soma = Number(novaLista.reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2));
    onTotalChange(soma, novaLista);
    if (servicoId) {
      await supabase.from('servicos_horimetro').update({ despesa_manutencao: soma }).eq('id', servicoId);
    }
  };

  const handleAdicionar = async (novoDTO: Omit<DespesaItemServico, 'id'>) => {
    const novoItem: DespesaItemServico = {
      ...novoDTO,
      id: `manut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    };
    await recalcularEAtualizar([...itens, novoItem]);
    if (servicoId) {
      await salvarItemManutencaoCompleto({
        item: novoItem, servicoId, clienteNome, maquinaId, maquinaNome, obraId: obraId || null, tenantId: tenantAtivoId
      });
    }
  };

  const handleSalvarEdicao = async (id: string, updates: Omit<DespesaItemServico, 'id'>) => {
    const editado: DespesaItemServico = { ...updates, id };
    const novaLista = itens.map((i) => (i.id === id ? editado : i));
    await recalcularEAtualizar(novaLista);
    setItemEmEdicao(null);
    if (servicoId) {
      await salvarItemManutencaoCompleto({
        item: editado, servicoId, clienteNome, maquinaId, maquinaNome, obraId: obraId || null, tenantId: tenantAtivoId
      });
    }
  };

  const handleExcluir = async (id: string) => {
    setExcluindoId(id);
    if (itemEmEdicao?.id === id) setItemEmEdicao(null);
    try {
      const novaLista = itens.filter((i) => i.id !== id);
      await recalcularEAtualizar(novaLista);
      if (servicoId) await excluirItemManutencaoCompleto(id, servicoId);
    } finally {
      setExcluindoId(null);
    }
  };

  const totalAtual = Number(itens.reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2)) || initialTotal;

  return (
    <div className="p-3.5 bg-orange-50/60 border border-orange-200/90 rounded-2xl space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-orange-200/70 pb-2">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-orange-600" />
          <span className="font-bold text-gray-900 text-xs">
            3. Planilha de Peças, Lubrificantes & Manutenção ({itens.length})
          </span>
        </div>
        <span className="text-[11px] font-bold text-orange-950 bg-orange-100/90 px-2.5 py-0.5 rounded-full font-mono">
          R$ {totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <PecasManutencaoForm
        dataPadrao={dataPadrao} onAdicionar={handleAdicionar}
        itemEmEdicao={itemEmEdicao} onSalvarEdicao={handleSalvarEdicao}
        onCancelarEdicao={() => setItemEmEdicao(null)} disabled={carregando}
      />
      <PecasManutencaoListRows
        itens={itens} onEditar={(it) => setItemEmEdicao(it)}
        onExcluir={handleExcluir} excluindoId={excluindoId} editandoId={itemEmEdicao?.id}
      />
    </div>
  );
};
