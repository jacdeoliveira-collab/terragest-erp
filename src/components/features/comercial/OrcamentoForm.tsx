import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useClientes } from '../../../hooks/useClientes';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useOrcamentoFormState } from './useOrcamentoFormState';
import { OrcamentoClienteCard } from './OrcamentoClienteCard';
import { OrcamentoMaquinasListSection } from './OrcamentoMaquinasListSection';
import { OrcamentoObraEscopoSection } from './OrcamentoObraEscopoSection';
import { OrcamentoValoresSection } from './OrcamentoValoresSection';
import { OrcamentoCondicoesOperacionaisSection } from './OrcamentoCondicoesOperacionaisSection';
import { OrcamentoCondicoesPagamentoSection } from './OrcamentoCondicoesPagamentoSection';
import { OrcamentoFormFooter } from './OrcamentoFormFooter';
import { ClienteModal } from './ClienteModal';
import { NovoEquipamentoModal } from './modal/NovoEquipamentoModal';
import type { Orcamento, CreateOrcamentoDTO } from '../../../types/comercial.types';

interface OrcamentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (dto: CreateOrcamentoDTO) => Promise<{ success: boolean; error?: string }>;
  orcamentoParaEditar?: Orcamento | null;
  onUpdate?: (id: string, dto: Partial<CreateOrcamentoDTO>) => Promise<{ success: boolean; error?: string }>;
}

export const OrcamentoForm: React.FC<OrcamentoFormProps> = ({
  onSuccess, onCancel, onSubmit, orcamentoParaEditar, onUpdate
}) => {
  const { clientes, criarCliente } = useClientes();
  const { data: equipments, refetch: refetchEquipments } = useEquipments({ onlyActives: true });
  const { data: funcionarios } = useFuncionarios();
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [modalMaquinaAberto, setModalMaquinaAberto] = useState(false);

  const st = useOrcamentoFormState(orcamentoParaEditar, equipments || [], onSubmit, onUpdate, onSuccess);
  const clienteSelecionado = (clientes || []).find((c) => c.id === st.clienteId);
  const operadores = (funcionarios || []).map((f) => f.nome).filter(Boolean);

  const handleSelectCliente = (id: string) => {
    st.setClienteId(id);
    const cli = (clientes || []).find((c) => c.id === id);
    if (cli?.endereco && !st.localObra) st.setLocalObra(cli.endereco);
  };

  const handleCriarClienteRapido = async (dados: any) => {
    const res = await criarCliente(dados);
    if (res.success && res.data) {
      st.setClienteId(res.data.id);
      if (res.data.endereco && !st.localObra) st.setLocalObra(res.data.endereco);
    }
    return res.success;
  };

  return (
    <>
      <form onSubmit={st.handleSubmit} className="space-y-3.5 text-xs text-left max-h-[80vh] overflow-y-auto pr-1">
        {st.erro && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{st.erro}</div>}

        <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-800">1. Cliente Contratante *</label>
            <button type="button" onClick={() => setModalClienteAberto(true)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold cursor-pointer text-[11px]">
              <Plus className="w-3 h-3" /> Cadastrar Novo Cliente
            </button>
          </div>
          <select required value={st.clienteId} onChange={(e) => handleSelectCliente(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium">
            <option value="">Selecione o Cliente na Carteira...</option>
            {(clientes || []).map((c) => (<option key={c.id} value={c.id}>{c.nome} {c.documento ? `(${c.documento})` : ''}</option>))}
          </select>
          <OrcamentoClienteCard cliente={clienteSelecionado} />
        </div>

        <OrcamentoMaquinasListSection
          itens={st.maquinasItens}
          equipments={equipments || []}
          operadores={operadores}
          onAddMaquina={st.handleAddMaquina}
          onRemoveMaquina={st.handleRemoveMaquina}
          onUpdateMaquina={st.handleUpdateMaquina}
          onSelectEquipmentFrota={st.handleSelectEquipmentFrota}
          onAbrirNovaMaquina={() => setModalMaquinaAberto(true)}
        />

        <OrcamentoObraEscopoSection
          obraId={st.obraId} setObraId={st.setObraId}
          obraNome={st.obraNome} setObraNome={st.setObraNome}
          localObra={st.localObra} setLocalObra={st.setLocalObra}
          tipoOperacao={st.tipoOperacao} setTipoOperacao={st.setTipoOperacao}
          tipoTerreno={st.tipoTerreno} setTipoTerreno={st.setTipoTerreno}
          regimeTrabalho={st.regimeTrabalho} setRegimeTrabalho={st.setRegimeTrabalho}
          previsaoInicio={st.previsaoInicio} setPrevisaoInicio={st.setPrevisaoInicio}
          descricaoServico={st.descricaoServico} setDescricaoServico={st.setDescricaoServico}
        />

        <OrcamentoValoresSection
          valorMobilizacao={st.valorMobilizacao} setValorMobilizacao={st.setValorMobilizacao}
          valorHoraParada={st.valorHoraParada} setValorHoraParada={st.setValorHoraParada}
          valorDesconto={st.valorDesconto} setValorDesconto={st.setValorDesconto}
          validadeDias={st.validadeDias} setValidadeDias={st.setValidadeDias}
        />

        <OrcamentoCondicoesOperacionaisSection
          operadorIncluso={st.operadorIncluso} setOperadorIncluso={st.setOperadorIncluso}
          combustivelTermo={st.combustivelTermo} setCombustivelTermo={st.setCombustivelTermo}
          mobilizacaoTermo={st.mobilizacaoTermo} setMobilizacaoTermo={st.setMobilizacaoTermo}
          alimentacaoTermo={st.alimentacaoTermo} setAlimentacaoTermo={st.setAlimentacaoTermo}
          guardaTermo={st.guardaTermo} setGuardaTermo={st.setGuardaTermo}
          observacoesLivres={st.observacoesLivres} setObservacoesLivres={st.setObservacoesLivres}
        />

        <OrcamentoCondicoesPagamentoSection
          formaPagamento={st.formaPagamento} setFormaPagamento={st.setFormaPagamento}
          condicaoPagamento={st.condicaoPagamento} setCondicaoPagamento={st.setCondicaoPagamento}
          contaBancariaId={st.contaBancariaId} setContaBancariaId={st.setContaBancariaId}
          prazoDescricao={st.prazoDescricao} setPrazoDescricao={st.setPrazoDescricao}
          dataVencimento={st.dataVencimento} setDataVencimento={st.setDataVencimento}
        />

        <OrcamentoFormFooter
          subtotal={st.subtotalHoras}
          valorMobilizacao={st.valorMobilizacao}
          valorDesconto={st.valorDesconto}
          valorTotal={st.valorTotal}
          salvando={st.salvando}
          clienteId={st.clienteId}
          isEdicao={Boolean(orcamentoParaEditar)}
          onCancel={onCancel}
        />
      </form>

      <ClienteModal isOpen={modalClienteAberto} onClose={() => setModalClienteAberto(false)} clienteParaEditar={null} onSalvar={handleCriarClienteRapido} />
      <NovoEquipamentoModal isOpen={modalMaquinaAberto} onClose={() => setModalMaquinaAberto(false)} onCreated={() => refetchEquipments()} />
    </>
  );
};
