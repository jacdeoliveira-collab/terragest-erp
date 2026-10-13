import React, { useState } from 'react';
import { Fuel, FileText, FileSpreadsheet, Plus, AlertCircle, Receipt } from 'lucide-react';
import { useAbastecimentos } from '../../../hooks/useAbastecimentos';
import { Modal } from '../../ui/Modal';
import { AbastecimentoForm } from './AbastecimentoForm';
import { AbastecimentoTable } from './AbastecimentoTable';
import { CupomCombustivelModal } from './modal/CupomCombustivelModal';
import { AbastecimentoEditModal } from './modal/AbastecimentoEditModal';
import { AbastecimentoDetalhesModal } from './modal/AbastecimentoDetalhesModal';
import { exportarAbastecimentosPDF } from '../../../utils/exportOperacionalPdf';
import { exportToExcel } from '../../../services/exportExcel';
import type { AbastecimentoItem } from '../../../types/abastecimento.types';

import { AbastecimentoKpiCards } from './AbastecimentoKpiCards';

export const AbastecimentoList: React.FC = () => {
  const { data, isLoading, error, refetch, atualizarAbastecimento, excluirAbastecimento } = useAbastecimentos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCupomModalOpen, setIsCupomModalOpen] = useState(false);
  const [abastecimentoDetalhes, setAbastecimentoDetalhes] = useState<AbastecimentoItem | null>(null);
  const [abastecimentoParaEditar, setAbastecimentoParaEditar] = useState<AbastecimentoItem | null>(null);

  const handleCreated = () => {
    setIsModalOpen(false);
    setIsCupomModalOpen(false);
    setAbastecimentoParaEditar(null);
    refetch();
  };

  const handleExcluir = async (item: AbastecimentoItem) => {
    const nome = item.maquina_codigo || item.maquina_nome || 'este registro';
    if (window.confirm(`Deseja realmente excluir o abastecimento da máquina ${nome} do dia ${item.data} (${item.quantidade_litros}L)?`)) {
      await excluirAbastecimento(item.id);
      if (abastecimentoDetalhes?.id === item.id) setAbastecimentoDetalhes(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando registros de abastecimento de combustível...
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Controle de Abastecimentos & Diesel</h2>
          <p className="text-xs text-gray-500">Clique em qualquer registro para visualizar detalhes completos e comprovante fiscal</p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => exportarAbastecimentosPDF(data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportToExcel(data as unknown as Record<string, unknown>[], 'Abastecimentos_TerraGest')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => setIsCupomModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer ml-1"
          >
            <Receipt className="w-4 h-4" />
            <span>Lançar Cupom Fiscal</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abastecimento Simples</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {data.length > 0 && <AbastecimentoKpiCards data={data} />}

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Fuel className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum abastecimento cadastrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">Cadastre os abastecimentos de diesel S10/S500 para acompanhar os custos e consumo da frota.</p>
          <button onClick={() => setIsCupomModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
            <Receipt className="w-4 h-4" />
            <span>Lançar Cupom Fiscal</span>
          </button>
        </div>
      ) : (
        <AbastecimentoTable
          data={data}
          onVerDetalhes={(item) => setAbastecimentoDetalhes(item)}
          onEditar={(item) => setAbastecimentoParaEditar(item)}
          onExcluir={handleExcluir}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Abastecimento Simples">
        <AbastecimentoForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <CupomCombustivelModal
        isOpen={isCupomModalOpen}
        onClose={() => setIsCupomModalOpen(false)}
        onSuccess={handleCreated}
      />

      <AbastecimentoDetalhesModal
        isOpen={Boolean(abastecimentoDetalhes)}
        onClose={() => setAbastecimentoDetalhes(null)}
        abastecimento={abastecimentoDetalhes}
        onEditar={(item) => setAbastecimentoParaEditar(item)}
        onExcluir={handleExcluir}
      />

      <AbastecimentoEditModal
        isOpen={Boolean(abastecimentoParaEditar)}
        onClose={() => setAbastecimentoParaEditar(null)}
        abastecimento={abastecimentoParaEditar}
        onSalvar={atualizarAbastecimento}
      />
    </div>
  );
};
