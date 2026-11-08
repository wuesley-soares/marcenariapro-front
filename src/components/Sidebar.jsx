import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  LayoutDashboard,
  Contact,
  FolderKanban,
  FileText,
  ClipboardList,
  Hammer,
  Package,
  Wallet,
  Wrench,
  ChartNoAxesCombined,
  LogOut,
  Truck
} from 'lucide-react'

import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/', { replace: true })
  }

  let usuario = {}

  try {
    usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    )
  } catch {
    usuario = {}
  }

  const nome = usuario.nome || 'Usuário'
  const perfil = usuario.perfil || 'Conta conectada'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img
          src="/logo-marcenariapro.png"
          alt="MarcenariaPro"
        />
      </div>

      <nav className="sidebar-menu">
        <Link to="/funcionarios">
          <Users size={19} />
          <span>Funcionários</span>
        </Link>

        <Link to="/dashboard">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </Link>

        <Link to="/clientes">
          <Contact size={19} />
          <span>Clientes</span>
        </Link>

        <Link to="/fornecedores">
          <Truck size={19} />
          <span>Fornecedores</span>
        </Link>

        <Link to="/projetos">
          <FolderKanban size={19} />
          <span>Projetos</span>
        </Link>

        <Link to="/orcamentos">
          <FileText size={19} />
          <span>Orçamentos</span>
        </Link>

        <Link to="/pedidos">
          <ClipboardList size={19} />
          <span>Pedidos</span>
        </Link>

        <Link to="/producao">
          <Hammer size={19} />
          <span>Produção</span>
        </Link>

        <Link to="/estoque">
          <Package size={19} />
          <span>Estoque</span>
        </Link>

        <Link to="/pagamentos">
          <Wallet size={19} />
          <span>Pagamentos</span>
        </Link>

        <Link to="/assistencias">
          <Wrench size={19} />
          <span>Assistência Técnica</span>
        </Link>

        <Link to="/relatorios">
          <ChartNoAxesCombined size={19} />
          <span>Relatórios</span>
        </Link>
      </nav>

      <div className="sidebar-usuario">
        <div className="sidebar-avatar">
          <span>{nome.charAt(0).toUpperCase()}</span>
        </div>

        <div className="sidebar-usuario-info">
          <strong title={nome}>{nome}</strong>
          <span>{perfil}</span>
        </div>
      </div>

      <button onClick={sair} className="sidebar-logout">
        <LogOut size={18} />
        <span>Sair da conta</span>
      </button>
    </aside>
  )
}

export default Sidebar