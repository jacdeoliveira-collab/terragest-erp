import React from 'react';
import { ObraList } from '../components/features/obras/ObraList';

export const Obras: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Centros de Custo & Obras</h1>
        <p className="text-xs text-gray-500">Gestão de canteiros para alocação e rateio de máquinas, combustíveis e BDEs</p>
      </div>
      <ObraList />
    </div>
  );
};

export default Obras;
