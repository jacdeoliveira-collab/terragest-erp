import React from 'react';
import { MedicoesList } from '../components/features/faturamento/MedicoesList';

export const Faturamento: React.FC = () => {
  return (
    <div className="space-y-6">
      <MedicoesList />
    </div>
  );
};

export default Faturamento;
