import React from 'react';
import { Modal } from '../../ui/Modal';
import { FuncionarioForm } from './FuncionarioForm';
import { FuncionarioVisualizacaoModal } from './FuncionarioVisualizacaoModal';
import { FuncionarioHistoricoModal } from './historico/FuncionarioHistoricoModal';
import { DefinirPinModal } from './DefinirPinModal';
import type { Funcionario } from '../../../types/rh.types';

interface FuncionarioModalsContainerProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  colaboradorEdicao: Funcionario | null;
  setColaboradorEdicao: (f: Funcionario | null) => void;
  colaboradorPerfil: Funcionario | null;
  setColaboradorPerfil: (f: Funcionario | null) => void;
  colaboradorHistorico: Funcionario | null;
  setColaboradorHistorico: (f: Funcionario | null) => void;
  modalTab: 'perfil' | 'compliance';
  funcionarioPin: Funcionario | null;
  setFuncionarioPin: (f: Funcionario | null) => void;
  atualizarFuncionario: (id: string, payload: Partial<Funcionario>) => Promise<{ success: boolean; error?: string; data?: any }>;
  configurarPin: (id: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  onSaved: () => void;
  onEditar: (f: Funcionario) => void;
}

export const FuncionarioModalsContainer: React.FC<FuncionarioModalsContainerProps> = ({
  isModalOpen, setIsModalOpen, colaboradorEdicao, setColaboradorEdicao,
  colaboradorPerfil, setColaboradorPerfil, colaboradorHistorico, setColaboradorHistorico,
  modalTab, funcionarioPin, setFuncionarioPin, atualizarFuncionario, configurarPin,
  onSaved, onEditar
}) => {
  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setColaboradorEdicao(null); }} title={colaboradorEdicao ? `Editar Colaborador: ${colaboradorEdicao.nome}` : 'Cadastrar Novo Colaborador'}>
        <FuncionarioForm
          key={colaboradorEdicao?.id || 'novo'} funcionarioParaEditar={colaboradorEdicao}
          onUpdateFuncionario={atualizarFuncionario} onSuccess={onSaved}
          onCancel={() => { setIsModalOpen(false); setColaboradorEdicao(null); }}
        />
      </Modal>

      <FuncionarioVisualizacaoModal
        isOpen={Boolean(colaboradorPerfil)} onClose={() => setColaboradorPerfil(null)}
        funcionario={colaboradorPerfil} initialTab={modalTab} onUpdateFuncionario={atualizarFuncionario}
        onEditar={(func) => { setColaboradorPerfil(null); onEditar(func); }}
      />

      <FuncionarioHistoricoModal
        isOpen={Boolean(colaboradorHistorico)} onClose={() => setColaboradorHistorico(null)}
        funcionario={colaboradorHistorico}
        onEditar={(func) => { setColaboradorHistorico(null); onEditar(func); }}
      />

      {funcionarioPin && (
        <DefinirPinModal
          isOpen={Boolean(funcionarioPin)} onClose={() => setFuncionarioPin(null)}
          funcionarioId={funcionarioPin.id} funcionarioNome={funcionarioPin.nome} onSalvarPin={configurarPin}
        />
      )}
    </>
  );
};
