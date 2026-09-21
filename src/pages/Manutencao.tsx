import React from 'react';
import { ManutencaoList } from '../components/features/manutencao/ManutencaoList';

export const Manutencao: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manutenção Preventiva & Lubrificação</h1>
        <p className="text-xs text-gray-500">Planejamento e acompanhamento de revisões periódicas da frota de terraplanagem</p>
      </div>

      <ManutencaoList />
    </div>
  );
};

export default Manutencao;
