import React from 'react';
import { TicketList } from '../components/features/producao/TicketList';

export const Producao: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Produção (Sinaleiro)</h1>
        <p className="text-xs text-gray-500">Controle de ciclos de transporte, DMT, cubagem e bota-fora da obra</p>
      </div>

      <TicketList />
    </div>
  );
};

export default Producao;
