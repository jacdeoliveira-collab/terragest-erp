import React, { useState } from 'react';
import { useContasReceber } from '../hooks/useContasReceber';
import { ContasReceberList } from '../components/features/financeiro/ContasReceberList';
import { BaixaTituloModal } from '../components/features/financeiro/BaixaTituloModal';
import { LancarHaverModal } from '../components/features/financeiro/LancarHaverModal';
import type { MedicaoItem, FormaPagamentoTitulo } from '../types/faturamento.types';

export const ContasReceber: React.FC = () => {
  const { data, isLoading, error, darBaixa, registrarHaver, excluirTitulo } = useContasReceber();
  const [tituloParaBaixa, setTituloParaBaixa] = useState<MedicaoItem | null>(null);
  const [tituloParaHaver, setTituloParaHaver] = useState<MedicaoItem | null>(null);
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [isHaverModalOpen, setIsHaverModalOpen] = useState(false);

  const handleAbrirBaixa = (item: MedicaoItem) => {
    setTituloParaBaixa(item);
    setIsBaixaModalOpen(true);
  };

  const handleAbrirHaver = (item: MedicaoItem) => {
    setTituloParaHaver(item);
    setIsHaverModalOpen(true);
  };

  const handleConfirmarBaixa = async (
    id: string,
    dataPagamento: string,
    formaPagamento: FormaPagamentoTitulo,
    contaBancariaId?: string
  ): Promise<boolean> => {
    const res = await darBaixa(id, dataPagamento, formaPagamento, contaBancariaId);
    return res.success;
  };

  const handleConfirmarHaver = async (
    id: string,
    valor: number,
    data: string,
    forma: string,
    obs?: string
  ): Promise<boolean> => {
    const res = await registrarHaver(id, valor, data, forma, obs);
    return res.success;
  };

  return (
    <div className="space-y-6">
      <ContasReceberList
        data={data}
        isLoading={isLoading}
        error={error}
        onAbrirBaixa={handleAbrirBaixa}
        onAbrirHaver={handleAbrirHaver}
        onExcluir={excluirTitulo}
      />

      <BaixaTituloModal
        isOpen={isBaixaModalOpen}
        onClose={() => { setIsBaixaModalOpen(false); setTituloParaBaixa(null); }}
        titulo={tituloParaBaixa}
        onConfirmar={handleConfirmarBaixa}
      />

      <LancarHaverModal
        isOpen={isHaverModalOpen}
        onClose={() => { setIsHaverModalOpen(false); setTituloParaHaver(null); }}
        titulo={tituloParaHaver}
        onSalvarHaver={handleConfirmarHaver}
      />
    </div>
  );
};

export default ContasReceber;
