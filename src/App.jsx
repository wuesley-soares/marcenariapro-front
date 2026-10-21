import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Projetos from './pages/Projetos'
import Ambientes from './pages/Ambientes'
import Orcamentos from './pages/Orcamentos'
import Pedidos from './pages/Pedidos'
import Pagamentos from './pages/Pagamentos'
import Producao from './pages/Producao'
import Estoque from './pages/Estoque'
import Assistencias from './pages/Assistencias'
import Usuarios from './pages/Usuarios'
import Relatorios from './pages/Relatorios'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route
              path="/projetos/:projetoId/ambientes"
              element={<Ambientes />}
            />
            <Route
              path="/ambientes/:ambienteId/orcamentos"
              element={<Orcamentos />}
            />
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/producao" element={<Producao />} />
            <Route path="/assistencias" element={<Assistencias />} />
            <Route path="/funcionarios" element={<Usuarios />} />
            <Route path="/estoque" element={<Estoque />} />
                    <Route path="/relatorios" element={<Relatorios />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App