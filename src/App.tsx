import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { Frota } from './pages/Frota';
import { Boletim } from './pages/Boletim';
import { RH } from './pages/RH';
import { Checklist } from './pages/Checklist';
import { Abastecimento } from './pages/Abastecimento';
import { Manutencao } from './pages/Manutencao';
import { Obras } from './pages/Obras';
import { Comercial } from './pages/Comercial';
import { MasterDashboard } from './pages/MasterDashboard';
import { EmpresaSettings } from './pages/EmpresaSettings';
import { Producao } from './pages/Producao';
import { Almoxarifado } from './pages/Almoxarifado';
import { Financeiro } from './pages/Financeiro';
import { SuperAdminRoute } from './components/auth/SuperAdminRoute';
import { GoogleOAuthCallback } from './pages/GoogleOAuthCallback';
import { HomeRoute } from './components/auth/HomeRoute';

import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route
            path="/oauth/google/callback"
            element={
              <ProtectedRoute>
                <GoogleOAuthCallback />
              </ProtectedRoute>
            }
          />

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
            <Route path="frota" element={<Frota />} />
            <Route path="obras" element={<Obras />} />
            <Route path="bde" element={<Boletim />} />
            <Route path="producao" element={<Producao />} />
            <Route path="almoxarifado" element={<Almoxarifado />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="faturamento" element={<Navigate to="/financeiro?aba=faturamento" replace />} />
            <Route path="receber" element={<Navigate to="/financeiro?aba=receber" replace />} />
            <Route path="pagar" element={<Navigate to="/financeiro?aba=pagar" replace />} />
            <Route path="rh" element={<RH />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="abastecimento" element={<Abastecimento />} />
            <Route path="manutencao" element={<Manutencao />} />
            <Route path="minha-empresa" element={<EmpresaSettings />} />
            <Route
              path="master"
              element={
                <SuperAdminRoute>
                  <MasterDashboard />
                </SuperAdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
