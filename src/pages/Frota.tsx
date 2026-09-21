import React from 'react';
import { EquipmentList } from '../components/features/frota/EquipmentList';

export const Frota: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestão de Frotas & Maquinário</h1>
        <p className="text-xs text-gray-500">Controle de horímetro, disponibilidade e manutenção preventiva</p>
      </div>

      <EquipmentList />
    </div>
  );
};

export default Frota;
