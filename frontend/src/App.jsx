import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import Perfil from './components/Perfil';
import Equipamentos from './components/Equipamentos';
import EquipamentoDetalhes from './components/EquipamentoDetalhes';
import CadastrarEquipamento from './components/CadastrarEquipamento';
import EditarEquipamento from './components/EditarEquipamento'; // Importar o novo componente
import Orcamentos from './components/Orcamentos';
import CriarOrcamento from './components/CriarOrcamento';
import OrcamentoDetalhes from './components/OrcamentoDetalhes';
import Reservas from './components/Reservas';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            
            <Route path="/equipamentos" element={<Equipamentos />} />
            <Route path="/equipamentos/:id" element={<EquipamentoDetalhes />} />
            <Route path="/equipamentos/cadastrar" element={<CadastrarEquipamento />} />
            <Route path="/equipamentos/editar/:id" element={<EditarEquipamento />} /> {/* Nova rota */}

            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/orcamentos/criar" element={<CriarOrcamento />} />
            <Route path="/orcamentos/criar/:equipamentoId" element={<CriarOrcamento />} />
            <Route path="/orcamentos/:id" element={<OrcamentoDetalhes />} />

            <Route path="/reservas" element={<Reservas />} />
          </Route>

          <Route path="*" element={<Login />} /> {/* Redireciona para login se a rota não for encontrada */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


