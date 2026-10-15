import React from 'react';
import { Modal } from '../../../ui/Modal';
import { AbastecimentoForm } from '../AbastecimentoForm';
import { CupomCombustivelModal } from './CupomCombustivelModal';
import { AbastecimentoEditModal } from './AbastecimentoEditModal';
import { AbastecimentoDetalhesModal } from './AbastecimentoDetalhesModal';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';

interface AbastecimentoModalsContainerProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  isCupomModalOpen: boolean;
  setIsCupomModalOpen: (v: boolean) => void;
  abastecimentoDetalhes: AbastecimentoItem | null;
  setAbastecimentoDetalhes: (v: AbastecimentoItem | null) => void;
  abastecimentoParaEditar: AbastecimentoItem | null;
  setAbastecimentoParaEditar: (v: AbastecimentoItem | null) => void;
  onSuccess: () => void;
  onAtualizar: (id: string, updates: Partial<AbastecimentoItem>) => Promise<{ success: boolean; error?: string }>;
  onExcluir: (item: AbastecimentoItem) => Promise<void>;
}

export const AbastecimentoModalsContainer: React.FC<AbastecimentoModalsContainerProps> = ({
  isModalOpen, setIsModalOpen, isCupomModalOpen, setIsCupomModalOpen,
  abastecimentoDetalhes, setAbastecimentoDetalhes, abastecimentoParaEditar, setAbastecimentoParaEditar,
  onSuccess, onAtualizar, onExcluir
}) => {
  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Abastecimento Simples">
        <AbastecimentoForm onSuccess={onSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <CupomCombustivelModal
        isOpen={isCupomModalOpen}
        onClose={() => setIsCupomModalOpen(false)}
        onSuccess={onSuccess}
      />

      <AbastecimentoDetalhesModal
        isOpen={Boolean(abastecimentoDetalhes)}
        onClose={() => setAbastecimentoDetalhes(null)}
        abastecimento={abastecimentoDetalhes}
        onEditar={(item) => setAbastecimentoParaEditar(item)}
        onExcluir={onExcluir}
      />

      <AbastecimentoEditModal
        isOpen={Boolean(abastecimentoParaEditar)}
        onClose={() => setAbastecimentoParaEditar(null)}
        abastecimento={abastecimentoParaEditar}
        onSalvar={onAtualizar}
      />
    </>
  );
};
