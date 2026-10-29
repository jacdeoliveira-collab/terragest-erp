import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ObraProvider } from '../../contexts/ObraContext';
import { RoleRoute } from '../auth/RoleRoute';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ObraProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-900 relative">
        {/* Backdrop para fechar a gaveta no celular ao clicar em qualquer lugar fora */}
        {isMobileMenuOpen && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Fechar menu lateral"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer animate-fade-in"
          />
        )}

        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header onOpenMenu={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            <RoleRoute>
              <Outlet />
            </RoleRoute>
          </main>
        </div>
      </div>
    </ObraProvider>
  );
};

export default MainLayout;
