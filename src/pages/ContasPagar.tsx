import React, { useState } from 'react';
import { useContasPagar } from '../hooks/useContasPagar';
import { ContasPagarList } from '../components/features/financeiro/ContasPagarList';
import { ContaPagarFormModal } from '../components/features/financeiro/ContaPagarFormModal';
import { EditarContaPagarModal } from '../components/features/financeiro/EditarContaPagarModal';
import { BaixaContaPagarModal } from '../components/features/financeiro/BaixaContaPagarModal';
import type { ContaPagarItem, FormaPagamentoDespesa } from '../types/contasPagar.types';

export const ContasPagar: React.FC = () => {
  const { data, isLoading, error, criarContaPagar, atualizarContaPagar, darBaixa } = useContasPagar();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [contaParaBaixa, setContaParaBaixa] = useState<ContaPagarItem | null>(null);
  const [contaParaEditar, setContaParaEditar] = useState<ContaPagarItem | null>(null);

  const handleAbrirBaixa = (conta: ContaPagarItem) => {
    setContaParaBaixa(conta);
    setIsBaixaModalOpen(true);
  };

  const handleConfirmarBaixa = async (
    id: string,
    dataPagamento: string,
    formaPagamento: FormaPagamentoDespesa,
    contaBancariaId?: string
  ): Promise<boolean> => {
    const res = await darBaixa(id, dataPagamento, formaPagamento, contaBancariaId);
    return res.success;
  };

  return (
    <div className="space-y-6">
      <ContasPagarList
        data={data}
        isLoading={isLoading}
        error={error}
        onAbrirNova={() => setIsFormModalOpen(true)}
        onAbrirBaixa={handleAbrirBaixa}
        onAbrirEditar={(conta) => setContaParaEditar(conta)}
      />

      <ContaPagarFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSalvar={criarContaPagar}
      />

      <EditarContaPagarModal
        isOpen={!!contaParaEditar}
        onClose={() => setContaParaEditar(null)}
        conta={contaParaEditar}
        onSalvar={atualizarContaPagar}
      />

      <BaixaContaPagarModal
        isOpen={isBaixaModalOpen}
        onClose={() => { setIsBaixaModalOpen(false); setContaParaBaixa(null); }}
        conta={contaParaBaixa}
        onConfirmar={handleConfirmarBaixa}
      />
    </div>
  );
};

export default ContasPagar;
