import React from 'react';
import { ChecklistList } from '../components/features/checklist/ChecklistList';

export const Checklist: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Checklists Diários</h1>
        <p className="text-xs text-gray-500">Inspeções de segurança e integridade mecânica antes da partida dos equipamentos</p>
      </div>

      <ChecklistList />
    </div>
  );
};

export default Checklist;
