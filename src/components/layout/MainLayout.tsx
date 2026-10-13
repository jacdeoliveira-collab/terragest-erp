import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ObraProvider } from '../../contexts/ObraContext';
import { RoleRoute } from '../auth/RoleRoute';

export const MainLayout: React.FC = () => {
  return (
    <ObraProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-900">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto p-6">
            <RoleRoute>
              <Outlet />
            </RoleRoute>
          </main>
        </div>
      </div>
    </ObraProvider>
  );
};

