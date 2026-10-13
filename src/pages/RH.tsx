import React, { useState } from 'react';
import { Users, Clock, Calculator, DollarSign } from 'lucide-react';
import { FuncionarioList } from '../components/features/rh/FuncionarioList';
import { PainelBancoHoras } from '../components/features/rh/PainelBancoHoras';
import { FechamentoFolha } from '../components/features/rh/FechamentoFolha';
import { RelatorioComissoes } from '../components/features/rh/RelatorioComissoes';

export const RH: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'colaboradores' | 'bancoHoras' | 'fechamentoFolha' | 'comissoes'>('colaboradores');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Recursos Humanos</h1>
          <p className="text-xs text-gray-500">Gestão de operadores, comissões de BDE e fechamento de folha</p>
        </div>

        <div className="flex flex-wrap items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
          <button
            onClick={() => setAbaAtiva('colaboradores')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'colaboradores' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Colaboradores</span>
          </button>

          <button
            onClick={() => setAbaAtiva('bancoHoras')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'bancoHoras' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Banco de Horas</span>
          </button>

          <button
            onClick={() => setAbaAtiva('fechamentoFolha')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'fechamentoFolha' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fechamento Folha</span>
          </button>

          <button
            onClick={() => setAbaAtiva('comissoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'comissoes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Comissões & Recibos</span>
          </button>
        </div>
      </div>

      {abaAtiva === 'colaboradores' && <FuncionarioList />}
      {abaAtiva === 'bancoHoras' && <PainelBancoHoras />}
      {abaAtiva === 'fechamentoFolha' && <FechamentoFolha />}
      {abaAtiva === 'comissoes' && <RelatorioComissoes />}
    </div>
  );
};

export default RH;
