import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import Perfil from './components/Perfil';
import Equipamentos from './components/Equipamentos';
import EquipamentoDetalhes from './components/EquipamentoDetalhes';
import CadastrarEquipamento from './components/CadastrarEquipamento';
import EditarEquipamento from './components/EditarEquipamento';
import Orcamentos from './components/Orcamentos';
import OrcamentoDetalhes from './components/OrcamentoDetalhes';
import CriarOrcamento from './components/CriarOrcamento';
import Reservas from './components/Reservas';
import ReservaDetalhes from './components/ReservaDetalhes';
import AdminReservas from './components/AdminReservas';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />
            
            {/* Rotas de equipamentos */}
            <Route path="/equipamentos" element={
              <ProtectedRoute>
                <Equipamentos />
              </ProtectedRoute>
            } />
            
            <Route path="/equipamentos/:id" element={
              <ProtectedRoute>
                <EquipamentoDetalhes />
              </ProtectedRoute>
            } />
            
            <Route path="/equipamentos/cadastrar" element={
              <ProtectedRoute requireStaff={true}>
                <CadastrarEquipamento />
              </ProtectedRoute>
            } />
            
            <Route path="/equipamentos/:id/editar" element={
              <ProtectedRoute requireStaff={true}>
                <EditarEquipamento />
              </ProtectedRoute>
            } />
            
            {/* Rotas de orçamentos */}
            <Route path="/orcamentos" element={
              <ProtectedRoute>
                <Orcamentos />
              </ProtectedRoute>
            } />
            
            <Route path="/orcamentos/criar" element={
              <ProtectedRoute>
                <CriarOrcamento />
              </ProtectedRoute>
            } />
            
            <Route path="/orcamentos/:id" element={
              <ProtectedRoute>
                <OrcamentoDetalhes />
              </ProtectedRoute>
            } />
            
            <Route path="/orcamento/adicionar/:equipamentoId" element={
              <ProtectedRoute>
                <CriarOrcamento />
              </ProtectedRoute>
            } />
            
            {/* Rotas de reservas */}
            <Route path="/reservas" element={
              <ProtectedRoute>
                <Reservas />
              </ProtectedRoute>
            } />
            
            <Route path="/reservas/:id" element={
              <ProtectedRoute>
                <ReservaDetalhes />
              </ProtectedRoute>
            } />
            
            {/* Rotas administrativas */}
            <Route path="/admin/reservas" element={
              <ProtectedRoute requireStaff={true}>
                <AdminReservas />
              </ProtectedRoute>
            } />
            
            {/* Rota de fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

