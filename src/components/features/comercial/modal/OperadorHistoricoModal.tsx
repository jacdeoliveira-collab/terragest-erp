import React, { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { UserCheck, RefreshCw, AlertCircle, Receipt, Plus, CheckCheck } from 'lucide-react';
import { useOperadorHistorico } from '../../../../hooks/useOperadorHistorico';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { OperadorHistoricoCards } from './OperadorHistoricoCards';
import { OperadorHistoricoServicosTable } from './OperadorHistoricoServicosTable';
import { ValesTable } from '../../rh/vales/ValesTable';
import { LancarValeModal } from '../../rh/vales/LancarValeModal';
import { excluirValeColaborador } from '../../../../services/valeRhService';
import { reconciliarBaixasOperador } from '../../../../services/operadorRepasseBaixaService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operadorNome: string;
  operadorId?: string;
}

export const OperadorHistoricoModal: React.FC<Props> = ({ isOpen, onClose, operadorNome, operadorId }) => {
  const { tenantAtivoId } = useTenantContext();
  const { data, isLoading, error, refetch } = useOperadorHistorico(operadorNome, operadorId);
  const [modalValeAberto, setModalValeAberto] = useState(false);
  const [conciliando, setConciliando] = useState(false);
  const [msgBaixa, setMsgBaixa] = useState<string | null>(null);

  if (!operadorNome && !operadorId) return null;

  const handleConciliarRepasses = async () => {
    setConciliando(true);
    setMsgBaixa(null);
    try {
      const r = await reconciliarBaixasOperador({ tenantId: tenantAtivoId, operadorNome, operadorId });
      setMsgBaixa(`Baixa aplicada: ${r.servicosQuitados} serviço(s) quitado(s), ${r.servicosParciais} parcial(is) e ${r.contasBaixadas} conta(s) a pagar baixada(s).`);
      await refetch();
    } finally {
      setConciliando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Produção & Repasses do Operador: ${operadorNome}`} maxWidth="4xl">
      <div className="space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">{operadorNome}</div>
              <p className="text-[11px] text-gray-500">Repasses descontam automaticamente os serviços mais antigos (FIFO)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data.totalVales > 0 && (
              <button type="button" onClick={handleConciliarRepasses} disabled={conciliando} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{conciliando ? 'Dando baixa...' : 'Dar Baixa c/ Repasses'}</span>
              </button>
            )}
            <button type="button" onClick={() => setModalValeAberto(true)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs">
              <Plus className="w-3.5 h-3.5" /><span>Novo Repasse / Vale</span>
            </button>
            <button type="button" onClick={refetch} title="Recarregar Extrato" className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {msgBaixa && <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">{msgBaixa}</div>}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /><span>{error}</span>
          </div>
        )}

        <OperadorHistoricoCards data={data} />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span>Repasses, Adiantamentos & Vales ({data.vales.length})</span>
            </h4>
            <span className="text-[11px] font-mono font-bold text-purple-800">
              Total Repassado: R$ {data.totalVales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <ValesTable
            vales={data.vales}
            onReload={refetch}
            onExcluir={async (id) => {
              await excluirValeColaborador(id);
              await reconciliarBaixasOperador({ tenantId: tenantAtivoId, operadorNome, operadorId }).catch(() => {});
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
