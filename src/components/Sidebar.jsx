
import { Link, useNavigate } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()

 function sair() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  navigate('/', { replace: true })
}

  // Tenta recuperar os dados do usuário autenticado.
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
        <h2>MarcenariaPro</h2>
      </div>

      <nav className="sidebar-menu">
        <Link to="/funcionarios">Funcionários</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/clientes">Clientes</Link>
        <Link to="/projetos">Projetos</Link>
        <Link to="/orcamentos">Orçamentos</Link>
        <Link to="/pedidos">Pedidos</Link>
        <Link to="/producao">Produção</Link>
        <Link to="/estoque">Estoque</Link>
        <Link to="/pagamentos">Pagamentos</Link>
        <Link to="/assistencias">Assistência Técnica</Link>
        <Link to="/relatorios">Relatórios</Link>
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
        Sair da conta
      </button>
    </aside>
  )
}

export default Sidebar
