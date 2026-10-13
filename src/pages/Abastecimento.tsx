import React from 'react';
import { AbastecimentoList } from '../components/features/abastecimento/AbastecimentoList';

export const Abastecimento: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Abastecimento & Combustível</h1>
        <p className="text-xs text-gray-500">Controle rigoroso de consumo de diesel S10/S500, horímetros e despesas de campo</p>
      </div>

      <AbastecimentoList />
    </div>
  );
};

export default Abastecimento;
