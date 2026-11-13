import React from 'react';
import { Users } from 'lucide-react';
import { ClienteList } from '../components/features/comercial/ClienteList';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const ClientesPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Clientes</span>
        </h1>
        <p className="text-xs text-gray-500">
          Cadastro e gestão de clientes para agendamentos, orçamentos e serviços
        </p>
      </div>

      <ErrorBoundary fallbackTitle="Erro ao carregar módulo de clientes">
        <ClienteList />
      </ErrorBoundary>
    </div>
  );
};

export default ClientesPage;

