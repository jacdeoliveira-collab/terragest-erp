import React, { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { Settings, RefreshCw, AlertCircle, Phone, DollarSign, Clock, Receipt, Plus } from 'lucide-react';
import { useFuncionarioHistorico } from '../../../../hooks/useFuncionarioHistorico';
import { FuncionarioHistoricoCards } from './FuncionarioHistoricoCards';
import { FuncionarioMaquinasResumo } from './FuncionarioMaquinasResumo';
import { FuncionarioProducaoTable } from './FuncionarioProducaoTable';
import { FuncionarioRemuneracaoTable } from './FuncionarioRemuneracaoTable';
import { QuitarOperadorModal } from './QuitarOperadorModal';
import { LancarValeModal } from '../vales/LancarValeModal';
import { ValesTable } from '../vales/ValesTable';
import { excluirValeColaborador } from '../../../../services/valeRhService';
import type { Funcionario } from '../../../../types/rh.types';
import type { FuncionarioRemuneracaoItem } from '../../../../types/funcionarioHistorico.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  funcionario: Funcionario | null;
  onEditar?: (funcionario: Funcionario) => void;
}

export const FuncionarioHistoricoModal: React.FC<Props> = ({ isOpen, onClose, funcionario, onEditar }) => {
  const { data, isLoading, error, refetch } = useFuncionarioHistorico(funcionario);
  const [subTab, setSubTab] = useState<'financeiro' | 'vales' | 'producao'>('financeiro');
  const [itemParaQuitar, setItemParaQuitar] = useState<FuncionarioRemuneracaoItem | null>(null);
  const [modalValeAberto, setModalValeAberto] = useState(false);
  const [filtroRemuneracao, setFiltroRemuneracao] = useState<'todos' | 'quitados' | 'pendentes'>('todos');

  const remuneracoesExibidas = React.useMemo(() => {
    if (filtroRemuneracao === 'quitados') return data.remuneracoes.filter((r) => r.status === 'PAGO');
    if (filtroRemuneracao === 'pendentes') return data.remuneracoes.filter((r) => r.status !== 'PAGO');
    return data.remuneracoes;
  }, [data.remuneracoes, filtroRemuneracao]);

  if (!funcionario) return null;

  const handleExcluirVale = async (id: string) => {
    await excluirValeColaborador(id);
    refetch();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha Operacional & Financeira: ${funcionario.nome}`} maxWidth="4xl">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10 gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span className="truncate">{funcionario.nome}</span>
              <span className="font-mono text-gray-500 font-normal shrink-0">• {funcionario.cargo.replace('_', ' ')}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 truncate">
              {funcionario.telefone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3 text-emerald-600" />{funcionario.telefone}</span>}
              <span>• CNH: {funcionario.vencimento_cnh || funcionario.validade_cnh || 'Não informada'}</span>
              <span>• ASO: {funcionario.vencimento_aso || funcionario.aso_validade || 'Não informado'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setModalValeAberto(true)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs">
              <Plus className="w-3.5 h-3.5" /><span>Novo Vale / Haver</span>
            </button>
            <button type="button" onClick={refetch} title="Recarregar" className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {onEditar && (
              <button type="button" onClick={() => { onClose(); onEditar(funcionario); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-200 shrink-0">
                <Settings className="w-3.5 h-3.5" /><span>Editar</span>
              </button>
            )}
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}

        <FuncionarioHistoricoCards data={data} onSelectAba={(tab, f) => { setSubTab(tab); if (f) setFiltroRemuneracao(f); }} />

        <div className="flex border-b border-gray-200 gap-1 pb-1">
          <button type="button" onClick={() => { setSubTab('financeiro'); setFiltroRemuneracao('todos'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${subTab === 'financeiro' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /><span>Remuneração & Serviços ({data.remuneracoes.length})</span>
          </button>
          <button type="button" onClick={() => setSubTab('vales')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${subTab === 'vales' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>
            <Receipt className="w-3.5 h-3.5 text-emerald-600" /><span>Vales & Haveres ({data.vales.length})</span>
          </button>
          <button type="button" onClick={() => setSubTab('producao')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${subTab === 'producao' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>
            <Clock className="w-3.5 h-3.5 text-emerald-600" /><span>Produção em Horas ({data.servicos.length + data.bulletins.length})</span>
          </button>
        </div>

        {subTab === 'financeiro' && (
          <div className="space-y-3">
            {data.vales.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    <span>Adiantamentos & Vales Registrados ({data.vales.length})</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-blue-800">
                    Total Já Pago / Vales: R$ {data.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <ValesTable vales={data.vales} onExcluir={handleExcluirVale} onReload={refetch} />
              </div>
            )}
            <FuncionarioRemuneracaoTable remuneracoes={remuneracoesExibidas} operadorNome={funcionario.nome} onQuitarItem={(it) => setItemParaQuitar(it)} />
          </div>
        )}
        {subTab === 'vales' && (
          <ValesTable vales={data.vales} onExcluir={handleExcluirVale} onReload={refetch} />
        )}
        {subTab === 'producao' && (
          <div className="space-y-3">
            <FuncionarioMaquinasResumo maquinas={data.maquinasOperadas} />
            <FuncionarioProducaoTable servicos={data.servicos} bulletins={data.bulletins} />
          </div>
        )}

        <QuitarOperadorModal isOpen={Boolean(itemParaQuitar)} onClose={() => setItemParaQuitar(null)} item={itemParaQuitar} operadorNome={funcionario.nome} onSuccess={() => refetch()} />
        <LancarValeModal isOpen={modalValeAberto} onClose={() => setModalValeAberto(false)} funcionarioInicial={funcionario} onSuccess={() => refetch()} />
      </div>
    </Modal>
  );
};
