import React, { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { Settings, RefreshCw, AlertCircle, Phone, DollarSign, Clock } from 'lucide-react';
import { useFuncionarioHistorico } from '../../../../hooks/useFuncionarioHistorico';
import { FuncionarioHistoricoCards } from './FuncionarioHistoricoCards';
import { FuncionarioMaquinasResumo } from './FuncionarioMaquinasResumo';
import { FuncionarioProducaoTable } from './FuncionarioProducaoTable';
import { FuncionarioRemuneracaoTable } from './FuncionarioRemuneracaoTable';
import { QuitarOperadorModal } from './QuitarOperadorModal';
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
  const [subTab, setSubTab] = useState<'financeiro' | 'producao'>('financeiro');
  const [itemParaQuitar, setItemParaQuitar] = useState<FuncionarioRemuneracaoItem | null>(null);

  const [filtroRemuneracao, setFiltroRemuneracao] = useState<'todos' | 'quitados' | 'pendentes'>('todos');

  const remuneracoesExibidas = React.useMemo(() => {
    if (filtroRemuneracao === 'quitados') return data.remuneracoes.filter((r) => r.status === 'PAGO');
    if (filtroRemuneracao === 'pendentes') return data.remuneracoes.filter((r) => r.status !== 'PAGO');
    return data.remuneracoes;
  }, [data.remuneracoes, filtroRemuneracao]);

  const handleCardSelect = (tab: 'financeiro' | 'producao', filtro?: 'todos' | 'quitados' | 'pendentes') => {
    setSubTab(tab);
    if (filtro) setFiltroRemuneracao(filtro);
  };

  if (!funcionario) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha Operacional & Financeira: ${funcionario.nome}`} maxWidth="4xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10 gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span className="truncate">{funcionario.nome}</span>
              <span className="font-mono text-gray-500 font-normal shrink-0">• {funcionario.cargo.replace('_', ' ')}</span>
              {funcionario.cpf && <span className="font-mono text-gray-400 font-normal shrink-0">• CPF: {funcionario.cpf}</span>}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 truncate">
              {funcionario.telefone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3 text-emerald-600" />{funcionario.telefone}</span>}
              <span>•</span>
              <span>CNH: {funcionario.vencimento_cnh || funcionario.validade_cnh || 'Não informada'}</span>
              <span>•</span>
              <span>ASO: {funcionario.vencimento_aso || funcionario.aso_validade || 'Não informado'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={refetch} title="Recarregar" className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {onEditar && (
              <button
                type="button"
                onClick={() => { onClose(); onEditar(funcionario); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-200 shrink-0 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" /><span>Editar Dados</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" /><span>{error}</span>
          </div>
        )}

        <FuncionarioHistoricoCards data={data} onSelectAba={handleCardSelect} />

        <div className="flex border-b border-gray-200 gap-1 pb-1">
          <button
            type="button"
            onClick={() => { setSubTab('financeiro'); setFiltroRemuneracao('todos'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'financeiro' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Remuneração & Pagamentos ({remuneracoesExibidas.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('producao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'producao' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Produção em Horas & Máquinas ({data.servicos.length + data.bulletins.length})</span>
          </button>
        </div>

        {subTab === 'financeiro' ? (
          <FuncionarioRemuneracaoTable
            remuneracoes={remuneracoesExibidas}
            onQuitarItem={(it) => setItemParaQuitar(it)}
          />
        ) : (
          <div className="space-y-3">
            <FuncionarioMaquinasResumo maquinas={data.maquinasOperadas} />
            <FuncionarioProducaoTable servicos={data.servicos} bulletins={data.bulletins} />
          </div>
        )}

        <QuitarOperadorModal
          isOpen={Boolean(itemParaQuitar)}
          onClose={() => setItemParaQuitar(null)}
          item={itemParaQuitar}
          operadorNome={funcionario.nome}
          onSuccess={() => refetch()}
        />
      </div>
    </Modal>
  );
};
