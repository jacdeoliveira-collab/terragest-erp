import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { PlanosProvider } from './contexts/PlanosContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { SuperAdminRoute } from './components/auth/SuperAdminRoute';
import { HomeRoute } from './components/auth/HomeRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RedefinirSenha } from './pages/RedefinirSenha';

const Frota = lazy(() => import('./pages/Frota').then((m) => ({ default: m.Frota })));
const Boletim = lazy(() => import('./pages/Boletim').then((m) => ({ default: m.Boletim })));
const RH = lazy(() => import('./pages/RH').then((m) => ({ default: m.RH })));
const Checklist = lazy(() => import('./pages/Checklist').then((m) => ({ default: m.Checklist })));
const Abastecimento = lazy(() => import('./pages/Abastecimento').then((m) => ({ default: m.Abastecimento })));
const Manutencao = lazy(() => import('./pages/Manutencao').then((m) => ({ default: m.Manutencao })));
const Comercial = lazy(() => import('./pages/Comercial').then((m) => ({ default: m.Comercial })));
const AgendaPage = lazy(() => import('./pages/AgendaPage').then((m) => ({ default: m.AgendaPage })));
const ClientesPage = lazy(() => import('./pages/ClientesPage').then((m) => ({ default: m.ClientesPage })));
const PlanosPage = lazy(() => import('./pages/PlanosPage').then((m) => ({ default: m.PlanosPage })));
const MobileHomePage = lazy(() => import('./pages/MobileHomePage').then((m) => ({ default: m.MobileHomePage })));
const MobileGestaoPage = lazy(() => import('./pages/MobileGestaoPage').then((m) => ({ default: m.MobileGestaoPage })));
const MasterDashboard = lazy(() => import('./pages/MasterDashboard').then((m) => ({ default: m.MasterDashboard })));
const EmpresaSettings = lazy(() => import('./pages/EmpresaSettings').then((m) => ({ default: m.EmpresaSettings })));
const Producao = lazy(() => import('./pages/Producao').then((m) => ({ default: m.Producao })));
const Almoxarifado = lazy(() => import('./pages/Almoxarifado').then((m) => ({ default: m.Almoxarifado })));
const Financeiro = lazy(() => import('./pages/Financeiro').then((m) => ({ default: m.Financeiro })));
const CentrosCustoTab = lazy(() => import('./components/features/financeiro/CentrosCustoTab').then((m) => ({ default: m.CentrosCustoTab })));
const GoogleOAuthCallback = lazy(() => import('./pages/GoogleOAuthCallback').then((m) => ({ default: m.GoogleOAuthCallback })));

const PageFallback: React.FC = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-xs font-medium text-slate-500">
    Carregando módulo...
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <PlanosProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                <Route path="/oauth/google/callback" element={<ProtectedRoute><GoogleOAuthCallback /></ProtectedRoute>} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallbackTitle="Falha no carregamento do sistema">
                        <MainLayout />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<HomeRoute />} />
                  <Route path="dashboard" element={<HomeRoute />} />
                  <Route path="comercial" element={<Comercial />} />
                  <Route path="agenda" element={<AgendaPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="frota" element={<Frota />} />
                  <Route path="centros-custo" element={<CentrosCustoTab />} />
                  <Route path="bde" element={<Boletim />} />
                  <Route path="producao" element={<Producao />} />
                  <Route path="almoxarifado" element={<Almoxarifado />} />
                  <Route path="financeiro" element={<Financeiro />} />
                  <Route path="asaas" element={<Navigate to="/minha-empresa?aba=integracoes" replace />} />
                  <Route path="faturamento" element={<Navigate to="/financeiro?aba=faturamento" replace />} />
                  <Route path="receber" element={<Navigate to="/financeiro?aba=receber" replace />} />
                  <Route path="pagar" element={<Navigate to="/financeiro?aba=pagar" replace />} />
                  <Route path="rh" element={<RH />} />
                  <Route path="checklist" element={<Checklist />} />
                  <Route path="abastecimento" element={<Abastecimento />} />
                  <Route path="manutencao" element={<Manutencao />} />
                  <Route path="planos" element={<PlanosPage />} />
                  <Route path="inicio" element={<MobileHomePage />} />
                  <Route path="gestao" element={<MobileGestaoPage />} />
                  <Route path="minha-empresa" element={<EmpresaSettings />} />
                  <Route path="master" element={<SuperAdminRoute><MasterDashboard /></SuperAdminRoute>} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PlanosProvider>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
