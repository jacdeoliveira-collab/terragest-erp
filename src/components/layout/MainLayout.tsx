import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { Header } from './Header';
import { ObraProvider } from '../../contexts/ObraContext';
import { WorkspaceModeProvider } from '../../contexts/WorkspaceModeContext';
import { AppearanceProvider } from '../../contexts/AppearanceContext';
import { useTenantContext } from '../../contexts/TenantContext';
import { RoleRoute } from '../auth/RoleRoute';
import { VersionUpdateAlert } from './VersionUpdateAlert';
import { PlanoBloqueadoGate } from '../features/planos/PlanoBloqueadoGate';
import { temAcessoModuloPorPlano } from '../../utils/planosCatalogo';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { tenantAtivo, isMaster } = useTenantContext();
  const moduloLiberado = temAcessoModuloPorPlano(tenantAtivo?.plano, location.pathname, isMaster);
  const nomeModulo = location.pathname.replace(/^\//, '').toUpperCase() || 'DASHBOARD';

  return (
    <AppearanceProvider>
      <WorkspaceModeProvider>
        <ObraProvider>
          <VersionUpdateAlert />
          <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-900 relative app-shell-root">
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

            <div className="hidden lg:flex h-full">
              <Sidebar isOpen={false} onClose={() => setIsMobileMenuOpen(false)} />
            </div>
            <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <Header onOpenMenu={() => setIsMobileMenuOpen(true)} />

              <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-4 lg:p-6 pb-20 lg:pb-6">
                <RoleRoute>
                  {moduloLiberado ? <Outlet /> : <PlanoBloqueadoGate nomeModulo={nomeModulo} />}
                </RoleRoute>
              </main>
            </div>
            <MobileBottomNav />
          </div>
        </ObraProvider>
      </WorkspaceModeProvider>
    </AppearanceProvider>
  );
};

export default MainLayout;
