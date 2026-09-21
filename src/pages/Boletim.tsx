import React from 'react';
import { BDEList } from '../components/features/bde/BDEList';

export const Boletim: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Boletins Diários de Equipamento</h1>
        <p className="text-xs text-gray-500">Gestão de apontamento de horas, produtividade e horímetros de campo</p>
      </div>

      <BDEList />
    </div>
  );
};

export default Boletim;
