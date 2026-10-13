import React, { useState } from 'react';
import { useFuncionarioHistorico } from '../../../../hooks/useFuncionarioHistorico';
import { FuncionarioHistoricoCards } from './FuncionarioHistoricoCards';
import { FuncionarioMaquinasResumo } from './FuncionarioMaquinasResumo';
import { FuncionarioProducaoTable } from './FuncionarioProducaoTable';
import { FuncionarioRemuneracaoTable } from './FuncionarioRemuneracaoTable';
import { QuitarOperadorModal } from './QuitarOperadorModal';
import { AlertCircle, RefreshCw, DollarSign, Clock } from 'lucide-react';
import type { Funcionario } from '../../../../types/rh.types';
import type { FuncionarioRemuneracaoItem } from '../../../../types/funcionarioHistorico.types';

interface Props {
  funcionario: Funcionario;
}

export const FuncionarioProducaoTab: React.FC<Props> = ({ funcionario }) => {
  const { data, isLoading, error, refetch } = useFuncionarioHistorico(funcionario);
  const [subTab, setSubTab] = useState<'financeiro' | 'producao'>('financeiro');
  const [itemParaQuitar, setItemParaQuitar] = useState<FuncionarioRemuneracaoItem | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          Ganhos, pagamentos e apuração de horas operadas
        </span>
        <button
          type="button"
          onClick={refetch}
          className="p-1 text-gray-400 hover:text-emerald-600 rounded cursor-pointer"
          title="Atualizar dados"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <FuncionarioHistoricoCards data={data} />

      <div className="flex border-b border-gray-200 gap-1 pb-1">
        <button
          type="button"
          onClick={() => setSubTab('financeiro')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'financeiro' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Remuneração & Pagamentos ({data.remuneracoes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('producao')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'producao' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Produção em Horas ({data.servicos.length + data.bulletins.length})</span>
        </button>
      </div>

      {subTab === 'financeiro' ? (
        <FuncionarioRemuneracaoTable
          remuneracoes={data.remuneracoes}
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
  );
};
