import React from 'react';
import { Modal } from '../../../ui/Modal';
import { UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useOperadorHistorico } from '../../../../hooks/useOperadorHistorico';
import { OperadorHistoricoCards } from './OperadorHistoricoCards';
import { OperadorHistoricoServicosTable } from './OperadorHistoricoServicosTable';

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

  if (!operadorNome && !operadorId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Extrato & Histórico do Operador: ${operadorNome}`} maxWidth="4xl">
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

          <button
            type="button"
            onClick={refetch}
            title="Recarregar Extrato"
            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <OperadorHistoricoCards data={data} />
        <OperadorHistoricoServicosTable servicos={data.servicos} />
      </div>
    </Modal>
  );
};
