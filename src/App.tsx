import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Frota } from './pages/Frota';
import { Boletim } from './pages/Boletim';
import { RH } from './pages/RH';
import { Checklist } from './pages/Checklist';
import { Abastecimento } from './pages/Abastecimento';
import { Manutencao } from './pages/Manutencao';
import { Obras } from './pages/Obras';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="frota" element={<Frota />} />
            <Route path="obras" element={<Obras />} />
            <Route path="bde" element={<Boletim />} />
            <Route path="rh" element={<RH />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="abastecimento" element={<Abastecimento />} />
            <Route path="manutencao" element={<Manutencao />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
