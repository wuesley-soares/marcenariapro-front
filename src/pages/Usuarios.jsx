
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Usuarios.css'

const formularioInicial = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  perfil: 'VENDEDOR',
  ativo: true
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [modo, setModo] = useState('cadastro')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [mostrarFormularioSenha, setMostrarFormularioSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')

  async function carregarUsuarios() {
    try {
      const resposta = await api.get('/usuarios')
      setUsuarios(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)

      if (error.response?.status === 403) {
        alert('Você não tem permissão para acessar os funcionários.')
        return
      }

      alert('Erro ao carregar funcionários.')
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  function alterarCampo(event) {
    const { name, value, type, checked } = event.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function abrirFormulario() {
    setModo('cadastro')
    setUsuarioSelecionado(null)
    setFormulario(formularioInicial)
    setMostrarFormulario(true)
    setMostrarFormularioSenha(false)
  }

  function abrirEdicao(usuario) {
    setModo('edicao')
    setUsuarioSelecionado(usuario)
    setFormulario({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '',
      confirmarSenha: '',
      perfil: usuario.perfil || 'VENDEDOR',
      ativo: usuario.ativo ?? true
    })
    setMostrarFormulario(true)
    setMostrarFormularioSenha(false)
  }

  function fecharFormulario() {
    setMostrarFormulario(false)
    setUsuarioSelecionado(null)
    setFormulario(formularioInicial)
  }

  async function salvarUsuario(event) {
    event.preventDefault()

    if (modo === 'cadastro') {
      if (formulario.senha !== formulario.confirmarSenha) {
        alert('A senha e a confirmação não coincidem.')
        return
      }

      if (formulario.senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.')
        return
      }
    }

    try {
      if (modo === 'cadastro') {
        const dados = {
          nome: formulario.nome,
          email: formulario.email,
          senha: formulario.senha,
          perfil: formulario.perfil
        }

        await api.post('/usuarios', dados)
        alert('Funcionário cadastrado com sucesso!')
      } else {
        const dados = {
          nome: formulario.nome,
          email: formulario.email,
          perfil: formulario.perfil,
          ativo: formulario.ativo
        }

        await api.put(`/usuarios/${usuarioSelecionado.id}`, dados)
        alert('Funcionário atualizado com sucesso!')
      }

      fecharFormulario()
      await carregarUsuarios()
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)

      alert(
        error.response?.data?.message ||
        'Erro ao salvar funcionário. Verifique os dados e tente novamente.'
      )
    }
  }

  function abrirAlteracaoSenha(usuario) {
    setUsuarioSelecionado(usuario)
    setNovaSenha('')
    setConfirmarNovaSenha('')
    setMostrarFormularioSenha(true)
    setMostrarFormulario(false)
  }

  async function salvarNovaSenha(event) {
    event.preventDefault()

    if (novaSenha.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      alert('A nova senha e a confirmação não coincidem.')
      return
    }

    try {
      await api.put(`/usuarios/${usuarioSelecionado.id}/senha`, {
        senha: novaSenha
      })

      alert('Senha alterada com sucesso!')
      setMostrarFormularioSenha(false)
      setUsuarioSelecionado(null)
      setNovaSenha('')
      setConfirmarNovaSenha('')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)

      alert(
        error.response?.data?.message ||
        'Não foi possível alterar a senha. Verifique se a rota existe no backend.'
      )
    }
  }

  function textoPerfil(perfil) {
    switch (perfil) {
      case 'ADMIN':
        return 'Administrador'
      case 'VENDEDOR':
        return 'Vendedor'
      case 'MARCENEIRO':
        return 'Marceneiro'
      default:
        return perfil
    }
  }

  function classePerfil(perfil) {
    switch (perfil) {
      case 'ADMIN':
        return 'perfil-admin'
      case 'VENDEDOR':
        return 'perfil-vendedor'
      case 'MARCENEIRO':
        return 'perfil-marceneiro'
      default:
        return ''
    }
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div>
          <h1>Funcionários</h1>
          <p>Cadastre e consulte os funcionários da marcenaria.</p>
        </div>

        <button
          className="botao-novo-usuario"
          onClick={abrirFormulario}
          type="button"
        >
          + Novo funcionário
        </button>
      </div>

      {mostrarFormulario && (
        <div className="usuario-form-card">
          <div className="form-header">
            <div>
              <h2>
                {modo === 'cadastro'
                  ? 'Novo funcionário'
                  : 'Editar funcionário'}
              </h2>
              <p>
                {modo === 'cadastro'
                  ? 'Preencha os dados para cadastrar um funcionário.'
                  : 'Atualize os dados do funcionário.'}
              </p>
            </div>

            <button
              className="botao-fechar"
              onClick={fecharFormulario}
              type="button"
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form onSubmit={salvarUsuario}>
            <div className="form-grid">
              <div className="campo">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={alterarCampo}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={alterarCampo}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>

              {modo === 'cadastro' && (
                <>
                  <div className="campo">
                    <label htmlFor="senha">Senha</label>
                    <input
                      id="senha"
                      type="password"
                      name="senha"
                      value={formulario.senha}
                      onChange={alterarCampo}
                      placeholder="Mínimo de 6 caracteres"
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="campo">
                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                    <input
                      id="confirmarSenha"
                      type="password"
                      name="confirmarSenha"
                      value={formulario.confirmarSenha}
                      onChange={alterarCampo}
                      placeholder="Digite a senha novamente"
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </>
              )}

              <div className="campo">
                <label htmlFor="perfil">Perfil</label>
                <select
                  id="perfil"
                  name="perfil"
                  value={formulario.perfil}
                  onChange={alterarCampo}
                  required
                >
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="MARCENEIRO">Marceneiro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {modo === 'edicao' && (
                <div className="campo campo-status">
                  <label htmlFor="ativo">Situação</label>
                  <select
                    id="ativo"
                    name="ativo"
                    value={String(formulario.ativo)}
                    onChange={(event) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        ativo: event.target.value === 'true'
                      }))
                    }
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-acoes">
              <button
                type="button"
                className="botao-cancelar"
                onClick={fecharFormulario}
              >
                Cancelar
              </button>

              <button type="submit" className="botao-salvar">
                {modo === 'cadastro'
                  ? 'Cadastrar funcionário'
                  : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {mostrarFormularioSenha && usuarioSelecionado && (
        <div className="usuario-form-card">
          <div className="form-header">
            <div>
              <h2>Alterar senha</h2>
              <p>
                Defina uma nova senha para {usuarioSelecionado.nome}.
              </p>
            </div>

            <button
              className="botao-fechar"
              onClick={() => setMostrarFormularioSenha(false)}
              type="button"
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form onSubmit={salvarNovaSenha}>
            <div className="form-grid">
              <div className="campo">
                <label htmlFor="novaSenha">Nova senha</label>
                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="confirmarNovaSenha">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmarNovaSenha"
                  type="password"
                  value={confirmarNovaSenha}
                  onChange={(event) =>
                    setConfirmarNovaSenha(event.target.value)
                  }
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Digite a nova senha novamente"
                  required
                />
              </div>
            </div>

            <div className="form-acoes">
              <button
                type="button"
                className="botao-cancelar"
                onClick={() => setMostrarFormularioSenha(false)}
              >
                Cancelar
              </button>

              <button type="submit" className="botao-salvar">
                Alterar senha
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="usuarios-card">
        <div className="usuarios-card-header">
          <div>
            <h2>Funcionários cadastrados</h2>
            <span>
              {usuarios.length}{' '}
              {usuarios.length === 1 ? 'funcionário' : 'funcionários'}
            </span>
          </div>
        </div>

        {usuarios.length === 0 ? (
          <div className="usuarios-vazio">
            <h3>Nenhum funcionário cadastrado</h3>
            <p>
              Clique em "Novo funcionário" para cadastrar o primeiro.
            </p>
          </div>
        ) : (
          <div className="tabela-container">
            <table className="usuarios-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="usuario-nome">
                        <div className="usuario-avatar">
                          {usuario.nome?.charAt(0).toUpperCase()}
                        </div>
                        <span>{usuario.nome}</span>
                      </div>
                    </td>

                    <td>{usuario.email}</td>

                    <td>
                      <span
                        className={`perfil-badge ${classePerfil(usuario.perfil)}`}
                      >
                        {textoPerfil(usuario.perfil)}
                      </span>
                    </td>

                    <td>
                      {usuario.ativo ? (
                        <span className="status-ativo">Ativo</span>
                      ) : (
                        <span className="status-inativo">Inativo</span>
                      )}
                    </td>

                    <td>
                      <div className="usuario-acoes">
                        <button
                          type="button"
                          className="botao-acao botao-editar"
                          onClick={() => abrirEdicao(usuario)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="botao-acao botao-senha"
                          onClick={() => abrirAlteracaoSenha(usuario)}
                        >
                          Alterar senha
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Usuarios
