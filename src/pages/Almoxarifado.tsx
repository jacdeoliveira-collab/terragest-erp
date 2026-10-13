import React from 'react';
import { MovimentacoesList } from '../components/features/almoxarifado/MovimentacoesList';

export const Almoxarifado: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Almoxarifado & Insumos</h1>
        <p className="text-xs text-gray-500">Controle de insumos pesados, tickets de balança e materiais</p>
      </div>

      <MovimentacoesList />
    </div>
  );
};

export default Almoxarifado;
