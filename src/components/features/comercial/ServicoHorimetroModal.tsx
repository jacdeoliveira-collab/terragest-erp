import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useClientes } from '../../../hooks/useClientes';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useServicoHorimetroModalState } from './modal/useServicoHorimetroModalState';
import { ServicoModalHeader } from './modal/ServicoModalHeader';
import { ServicoModalBody } from './modal/ServicoModalBody';
import { ServicoModalFooter } from './modal/ServicoModalFooter';
import { ClienteModal } from './ClienteModal';
import { NovoEquipamentoModal } from './modal/NovoEquipamentoModal';
import { ConfirmarConclusaoSemHorimetroModal } from './modal/ConfirmarConclusaoSemHorimetroModal';
import type { Cliente } from '../../../types/comercial.types';
import type { ServicoHorimetro } from '../../../types/servicoHorimetro.types';

interface ServicoHorimetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (servico: Partial<ServicoHorimetro>) => Promise<{ success: boolean; data?: ServicoHorimetro; error?: string }>;
  servicoParaEditar?: ServicoHorimetro | null;
}

export const ServicoHorimetroModal: React.FC<ServicoHorimetroModalProps> = ({
  isOpen, onClose, onSave, servicoParaEditar
}) => {
  const { clientes, criarCliente, atualizarCliente } = useClientes();
  const { data: equipments, refetch: refetchEquipments } = useEquipments();
  const { data: funcionarios } = useFuncionarios();
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [modalMaquinaAberto, setModalMaquinaAberto] = useState(false);
  const [modalAvisoSemHorimetro, setModalAvisoSemHorimetro] = useState(false);

  const state = useServicoHorimetroModalState(servicoParaEditar, funcionarios, onSave, onClose);
  if (!isOpen) return null;

  const maquinasDisponiveis = equipments.map(eq => `${eq.name} (${eq.code})`);
  const operadoresDisponiveis = funcionarios.map(f => f.nome).filter(Boolean);

  const handleSalvarCliente = async (dados: any) => {
    if (clienteParaEditar) {
      const res = await atualizarCliente(clienteParaEditar.id, dados);
      if (res.success) {
        state.setClienteNome(dados.nome);
        state.setClienteDocumento(dados.documento || '');
        state.setClienteTelefone(dados.telefone || '');
      }
      return res.success;
    }
    const res = await criarCliente(dados);
    if (res.success && res.data) {
      state.setClienteId(res.data.id);
      state.setClienteNome(res.data.nome);
      state.setClienteDocumento(res.data.documento || '');
      state.setClienteTelefone(res.data.telefone || '');
    }
    return res.success;
  };

  const handleTentarConcluir = () => {
    const semHorimetroFinal = state.maquinasItens.length > 0
      ? state.maquinasItens.some(
          (m) => m.horimetro_final === undefined || m.horimetro_final === null || Number(m.horimetro_final) <= 0
        )
      : true;

    if (semHorimetroFinal) {
      setModalAvisoSemHorimetro(true);
      return;
    }
    state.handleSalvar(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-left animate-in fade-in zoom-in-95 duration-150">
        <ServicoModalHeader isEditing={!!servicoParaEditar} onClose={onClose} aba={state.aba} setAba={state.setAba} />
        {state.erro && (
          <div className="m-3 mb-0 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{state.erro}</span>
          </div>
        )}

        <ServicoModalBody
          state={state}
          clientes={clientes}
          maquinasDisponiveis={maquinasDisponiveis}
          operadoresDisponiveis={operadoresDisponiveis}
          servicoId={servicoParaEditar?.id}
          onAbrirNovoCliente={() => { setClienteParaEditar(null); setModalClienteAberto(true); }}
          onAbrirNovaMaquina={() => setModalMaquinaAberto(true)}
          onEditarCliente={(c) => { setClienteParaEditar(c); setModalClienteAberto(true); }}
          onSelectOperador={(opNome) => state.aplicarOperador(opNome)}
        />

        <ServicoModalFooter
          onClose={onClose} salvando={state.salvando}
          onSalvarEmAndamento={() => state.handleSalvar(false)}
          onConcluirServico={handleTentarConcluir}
        />
      </div>

      <ConfirmarConclusaoSemHorimetroModal
        isOpen={modalAvisoSemHorimetro}
        clienteNome={state.clienteNome}
        maquinaNome={state.maquinaNome}
        onVoltar={() => {
          setModalAvisoSemHorimetro(false);
          state.setAba('horimetros');
        }}
        onConfirmarConclusao={() => {
          setModalAvisoSemHorimetro(false);
          state.handleSalvar(true);
        }}
      />
      <ClienteModal
        isOpen={modalClienteAberto} onClose={() => setModalClienteAberto(false)}
        clienteParaEditar={clienteParaEditar} onSalvar={handleSalvarCliente}
      />
      <NovoEquipamentoModal
        isOpen={modalMaquinaAberto} onClose={() => setModalMaquinaAberto(false)}
        onCreated={(maq) => { state.setMaquinaNome(maq); refetchEquipments(); }}
      />
    </div>
  );
};
