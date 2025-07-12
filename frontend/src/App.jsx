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
import EditarEquipamento from './components/EditarEquipamento';
import Orcamentos from './components/Orcamentos';
import CriarOrcamento from './components/CriarOrcamento';
import OrcamentoDetalhes from './components/OrcamentoDetalhes';
import Reservas from './components/Reservas';
import ReservaDetalhes from './components/ReservaDetalhes'; // Importar o novo componente

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
            <Route path="/equipamentos/editar/:id" element={<EditarEquipamento />} />

            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/orcamentos/criar" element={<CriarOrcamento />} />
            <Route path="/orcamentos/criar/:equipamentoId" element={<CriarOrcamento />} />
            <Route path="/orcamentos/:id" element={<OrcamentoDetalhes />} />

            <Route path="/reservas" element={<Reservas />} />
            <Route path="/reservas/:id" element={<ReservaDetalhes />} /> {/* Nova rota */}
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


