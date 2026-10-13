import React, { useState } from 'react';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import { useOrcamentos } from '../../../hooks/useOrcamentos';
import { Modal } from '../../ui/Modal';
import { OrcamentoForm } from './OrcamentoForm';
import { OrcamentoRowItem } from './list/OrcamentoRowItem';
import { ReciboAdiantamentoModal } from './modal/ReciboAdiantamentoModal';
import { supabase } from '../../../lib/supabase';
import type { Orcamento } from '../../../types/comercial.types';

export const OrcamentoList: React.FC = () => {
  const { orcamentos, isLoading, error, criarOrcamento, atualizarOrcamento, excluirOrcamento, atualizarStatusOrcamento } = useOrcamentos();
  const [modalAberto, setModalAberto] = useState(false);
  const [orcamentoParaEditar, setOrcamentoParaEditar] = useState<Orcamento | null>(null);
  const [orcamentoParaRecibo, setOrcamentoParaRecibo] = useState<Orcamento | null>(null);

  const handleNovo = () => { setOrcamentoParaEditar(null); setModalAberto(true); };
  const handleEditar = (orc: Orcamento) => { setOrcamentoParaEditar(orc); setModalAberto(true); };
  const handleExcluir = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta proposta comercial?')) {
      await excluirOrcamento(id);
    }
  };

  const handleSalvarAdiantamento = async (valor: number, forma: string, data: string) => {
    if (!orcamentoParaRecibo) return;
    const saldo = Math.max(0, orcamentoParaRecibo.valor_total - valor);
    await atualizarOrcamento(orcamentoParaRecibo.id, {
      valor_adiantamento: valor,
      data_adiantamento: data,
      forma_pagamento_adiantamento: forma,
      saldo_restante: saldo
    });

    // Registra recebimento no financeiro de Contas a Receber
    try {
      await supabase.from('contas_receber').insert([{
        cliente_id: orcamentoParaRecibo.cliente_id,
        valor_total: valor,
        data_vencimento: data,
        data_pagamento: data,
        forma_pagamento: forma,
        status_pagamento: 'PAGO',
        observacoes: `[SINAL_PROPOSTA:${orcamentoParaRecibo.id}] Adiantamento de proposta de locação`,
        competencia: data.slice(0, 7)
      }]);
    } catch {}
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-gray-400">Carregando propostas comerciais...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs text-left">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Orçamentos & Propostas de Locação
          </h3>
          <p className="text-[11px] text-gray-500">Estimativas de horas de máquinas pesadas, adiantamentos e aprovação comercial</p>
        </div>
        <button onClick={handleNovo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {orcamentos.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Nenhum orçamento cadastrado até o momento.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Cliente / Máquina</th>
                <th className="p-3.5">Escopo</th>
                <th className="p-3.5 text-right">R$ / Hora</th>
                <th className="p-3.5 text-center">Horas</th>
                <th className="p-3.5 text-right">Total / Sinal</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {orcamentos.map((orc: Orcamento) => (
                <OrcamentoRowItem
                  key={orc.id}
                  orc={orc}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                  onAtualizarStatus={atualizarStatusOrcamento}
                  onAbrirRecibo={setOrcamentoParaRecibo}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); setOrcamentoParaEditar(null); }}
        title={orcamentoParaEditar ? 'Editar Proposta Comercial' : 'Nova Proposta Comercial de Locação'}
      >
        <OrcamentoForm
          key={orcamentoParaEditar?.id || 'novo'}
          orcamentoParaEditar={orcamentoParaEditar}
          onSuccess={() => { setModalAberto(false); setOrcamentoParaEditar(null); }}
          onCancel={() => { setModalAberto(false); setOrcamentoParaEditar(null); }}
          onSubmit={criarOrcamento}
          onUpdate={atualizarOrcamento}
        />
      </Modal>

      {orcamentoParaRecibo && (
        <ReciboAdiantamentoModal
          isOpen={!!orcamentoParaRecibo}
          onClose={() => setOrcamentoParaRecibo(null)}
          clienteNome={orcamentoParaRecibo.cliente_nome || 'Cliente'}
          clienteDocumento={orcamentoParaRecibo.cliente_documento}
          clienteTelefone={orcamentoParaRecibo.cliente_telefone}
          descricaoOriginal={orcamentoParaRecibo.descricao_servico}
          valorTotalOriginal={orcamentoParaRecibo.valor_total}
          valorInicial={orcamentoParaRecibo.valor_adiantamento || 0}
          onConfirmarAdiantamento={handleSalvarAdiantamento}
        />
      )}
    </div>
  );
};
