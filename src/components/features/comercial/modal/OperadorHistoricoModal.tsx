import React, { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { UserCheck, RefreshCw, AlertCircle, Receipt, Plus } from 'lucide-react';
import { useOperadorHistorico } from '../../../../hooks/useOperadorHistorico';
import { OperadorHistoricoCards } from './OperadorHistoricoCards';
import { OperadorHistoricoServicosTable } from './OperadorHistoricoServicosTable';
import { ValesTable } from '../../rh/vales/ValesTable';
import { LancarValeModal } from '../../rh/vales/LancarValeModal';
import { excluirValeColaborador } from '../../../../services/valeRhService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operadorNome: string;
  operadorId?: string;
}

export const OperadorHistoricoModal: React.FC<Props> = ({
  isOpen, onClose, operadorNome, operadorId
}) => {
  const { data, isLoading, error, refetch } = useOperadorHistorico(operadorNome, operadorId);
  const [modalValeAberto, setModalValeAberto] = useState(false);

  if (!operadorNome && !operadorId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Produção & Histórico do Operador: ${operadorNome}`} maxWidth="4xl">
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">{operadorNome}</div>
              <p className="text-[11px] text-gray-500">Operador de Máquinas e Equipamentos Pesados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalValeAberto(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Vale / Adiantamento</span>
            </button>
            <button
              type="button"
              onClick={refetch}
              title="Recarregar Extrato"
              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <OperadorHistoricoCards data={data} />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span>Adiantamentos & Vales Registrados ({data.vales.length})</span>
            </h4>
            <span className="text-[11px] font-mono font-bold text-purple-800">
              Total Adiantado: R$ {data.totalVales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <ValesTable
            vales={data.vales}
            onReload={refetch}
            onExcluir={async (id) => {
              await excluirValeColaborador(id);
              refetch();
            }}
          />
        </div>

        <OperadorHistoricoServicosTable servicos={data.servicos} />

        <LancarValeModal
          isOpen={modalValeAberto}
          onClose={() => setModalValeAberto(false)}
          funcionarioInicial={operadorId ? ({ id: operadorId, nome: operadorNome, cargo: 'OPERADOR_MAQUINA' } as any) : null}
          onSuccess={() => refetch()}
        />
      </div>
    </Modal>
  );
};
