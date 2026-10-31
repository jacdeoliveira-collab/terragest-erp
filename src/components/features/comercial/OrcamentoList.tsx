import React, { useState } from 'react';
import { FileText, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOrcamentos } from '../../../hooks/useOrcamentos';
import { useTenantContext } from '../../../contexts/TenantContext';
import { Modal } from '../../ui/Modal';
import { OrcamentoForm } from './OrcamentoForm';
import { OrcamentoRowItem } from './list/OrcamentoRowItem';
import { ReciboAdiantamentoModal } from './modal/ReciboAdiantamentoModal';
import { converterOrcamentoEmServicoHorimetro } from './orcamentoConverterHelper';
import { supabase } from '../../../lib/supabase';
import type { Orcamento } from '../../../types/comercial.types';

interface OrcamentoListProps {
  onIrParaHorimetros?: () => void;
}

export const OrcamentoList: React.FC<OrcamentoListProps> = ({ onIrParaHorimetros }) => {
  const { orcamentos, isLoading, error, criarOrcamento, atualizarOrcamento, excluirOrcamento, atualizarStatusOrcamento } = useOrcamentos();
  const { tenantAtivoId } = useTenantContext();
  const [modalAberto, setModalAberto] = useState(false);
  const [orcamentoParaEditar, setOrcamentoParaEditar] = useState<Orcamento | null>(null);
  const [orcamentoParaRecibo, setOrcamentoParaRecibo] = useState<Orcamento | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const handleNovo = () => { setOrcamentoParaEditar(null); setModalAberto(true); };
  const handleEditar = (orc: Orcamento) => { setOrcamentoParaEditar(orc); setModalAberto(true); };
  const handleExcluir = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta proposta comercial?')) await excluirOrcamento(id);
  };

  const handleConverterEmServico = async (orc: Orcamento) => {
    const res = await converterOrcamentoEmServicoHorimetro(orc, tenantAtivoId);
    if (res.success) {
      await atualizarStatusOrcamento(orc.id, 'APROVADO');
      setMensagemSucesso(`Ordem de Serviço criada com sucesso para "${orc.cliente_nome}" em Serviços por Horímetro!`);
      if (onIrParaHorimetros) setTimeout(() => onIrParaHorimetros(), 900);
    }
  };

  const handleSalvarAdiantamento = async (valor: number, forma: string, data: string) => {
    if (!orcamentoParaRecibo) return;
    const saldo = Math.max(0, orcamentoParaRecibo.valor_total - valor);
    await atualizarOrcamento(orcamentoParaRecibo.id, {
      valor_adiantamento: valor, data_adiantamento: data, forma_pagamento_adiantamento: forma, saldo_restante: saldo
    });
    try {
      await supabase.from('contas_receber').insert([{
        cliente_id: orcamentoParaRecibo.cliente_id, valor_total: valor, data_vencimento: data, data_pagamento: data,
        forma_pagamento: forma, status_pagamento: 'PAGO',
        observacoes: `[SINAL_PROPOSTA:${orcamentoParaRecibo.id}] Adiantamento de proposta de locação`, competencia: data.slice(0, 7)
      }]);
    } catch {}
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-gray-400">Carregando propostas comerciais...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs text-left">
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Orçamentos & Propostas Executivas de Locação
          </h3>
          <p className="text-[11px] text-gray-500">Ficha técnica de maquinário, implementos, mobilização/prancha, franquia de horas e conversão direta em OS</p>
        </div>
        <button onClick={handleNovo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" /><span>Novo Orçamento Completo</span>
        </button>
      </div>

      {mensagemSucesso && (
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {mensagemSucesso}</span>
          <button onClick={() => setMensagemSucesso(null)} className="font-bold text-emerald-700 cursor-pointer">✕</button>
        </div>
      )}

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" /><span>{error}</span>
        </div>
      )}

      {orcamentos.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Nenhum orçamento cadastrado até o momento. Clique em "Novo Orçamento Completo" para criar.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Cliente / Maquinário & Implemento</th>
                <th className="p-3.5">Operação / Local / Escopo</th>
                <th className="p-3.5 text-right">R$ / Hora</th>
                <th className="p-3.5 text-center">Horas / Franquia</th>
                <th className="p-3.5 text-right">Total / Prancha / Sinal</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {orcamentos.map((orc: Orcamento) => (
                <OrcamentoRowItem
                  key={orc.id} orc={orc} onEditar={handleEditar} onExcluir={handleExcluir}
                  onAtualizarStatus={atualizarStatusOrcamento} onAbrirRecibo={setOrcamentoParaRecibo}
                  onConverterEmServico={handleConverterEmServico}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalAberto} onClose={() => { setModalAberto(false); setOrcamentoParaEditar(null); }} title={orcamentoParaEditar ? 'Editar Proposta Comercial de Locação' : 'Nova Proposta Comercial Completa de Maquinário'} maxWidth="4xl">
        <OrcamentoForm
          key={orcamentoParaEditar?.id || 'novo'} orcamentoParaEditar={orcamentoParaEditar}
          onSuccess={() => { setModalAberto(false); setOrcamentoParaEditar(null); }}
          onCancel={() => { setModalAberto(false); setOrcamentoParaEditar(null); }}
          onSubmit={criarOrcamento} onUpdate={atualizarOrcamento}
        />
      </Modal>

      {orcamentoParaRecibo && (
        <ReciboAdiantamentoModal
          isOpen={!!orcamentoParaRecibo} onClose={() => setOrcamentoParaRecibo(null)}
          clienteNome={orcamentoParaRecibo.cliente_nome || 'Cliente'} clienteDocumento={orcamentoParaRecibo.cliente_documento}
          clienteTelefone={orcamentoParaRecibo.cliente_telefone} descricaoOriginal={orcamentoParaRecibo.descricao_servico}
          valorTotalOriginal={orcamentoParaRecibo.valor_total} valorInicial={orcamentoParaRecibo.valor_adiantamento || 0}
          onConfirmarAdiantamento={handleSalvarAdiantamento}
        />
      )}
    </div>
  );
};
