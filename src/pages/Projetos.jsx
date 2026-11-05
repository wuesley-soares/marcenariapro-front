
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Projetos.css'
import { useNavigate } from 'react-router-dom'

function Projetos() {
  const navigate = useNavigate()

  const [projetos, setProjetos] = useState([])
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [projetoEditando, setProjetoEditando] = useState(null)
  const [pesquisa, setPesquisa] = useState('')

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    clienteId: ''
  })

  useEffect(() => {
    carregarProjetos()
    carregarClientes()
  }, [])

  async function carregarProjetos() {
    try {
      const resposta = await api.get('/projetos')
      setProjetos(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

  async function carregarClientes() {
    try {
      const resposta = await api.get('/clientes')
      setClientes(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      alert('Não foi possível carregar os clientes cadastrados.')
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function novoProjeto() {
    setProjetoEditando(null)

    setFormulario({
      nome: '',
      descricao: '',
      clienteId: ''
    })

    setMostrarFormulario(true)
  }

  function editarProjeto(projeto) {
    setProjetoEditando(projeto)

    setFormulario({
      nome: projeto.nome || '',
      descricao: projeto.descricao || '',
      clienteId: String(
        projeto.cliente?.id ?? projeto.clienteId ?? ''
      )
    })

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setProjetoEditando(null)

    setFormulario({
      nome: '',
      descricao: '',
      clienteId: ''
    })
  }

  async function salvarProjeto(event) {
    event.preventDefault()

    try {
      const dados = {
        nome: formulario.nome,
        descricao: formulario.descricao,
        clienteId: Number(formulario.clienteId)
      }

      if (projetoEditando) {
        await api.put(`/projetos/${projetoEditando.id}`, dados)
        alert('Projeto atualizado com sucesso!')
      } else {
        await api.post('/projetos', dados)
        alert('Projeto cadastrado com sucesso!')
      }

      cancelarFormulario()
      await carregarProjetos()
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar projeto.'

      alert(mensagem)
    }
  }

  async function excluirProjeto(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este projeto?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/projetos/${id}`)

      alert('Projeto excluído com sucesso!')
      await carregarProjetos()
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir projeto.'

      alert(mensagem)
    }
  }

  const projetosFiltrados = projetos.filter((projeto) => {
  const termo = pesquisa.toLowerCase().trim()

  const nomeCliente =
    projeto.cliente?.nome ||
    clientes.find(
      (cliente) =>
        cliente.id === (projeto.cliente?.id ?? projeto.clienteId)
    )?.nome ||
    ''

  return (
    projeto.nome?.toLowerCase().includes(termo) ||
    projeto.descricao?.toLowerCase().includes(termo) ||
    nomeCliente.toLowerCase().includes(termo)
  )
})

  return (
    <div className="projetos">
      <div className="projetos-header">
        <div>
          <h1>Projetos</h1>
          <p>Projetos cadastrados na marcenaria</p>
        </div>

        <button onClick={novoProjeto}>
          Novo projeto
        </button>
      </div>

      {mostrarFormulario && (
        <div className="projeto-formulario">
          <h2>
            {projetoEditando ? 'Editar projeto' : 'Novo projeto'}
          </h2>

          <form onSubmit={salvarProjeto}>
            <div>
              <label htmlFor="nome">Nome do projeto</label>

              <input
                id="nome"
                type="text"
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                placeholder="Ex.: Cozinha planejada"
                required
              />
            </div>

            <div>
              <label htmlFor="clienteId">Cliente</label>

              <select
                id="clienteId"
                name="clienteId"
                value={formulario.clienteId}
                onChange={alterarCampo}
                required
              >
                <option value="">Selecione um cliente</option>

                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-descricao">
              <label htmlFor="descricao">Descrição</label>

              <textarea
                id="descricao"
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                placeholder="Descrição do projeto"
                rows="4"
              />
            </div>

            <div className="formulario-botoes">
              <button
                type="button"
                onClick={cancelarFormulario}
              >
                Cancelar
              </button>

              <button type="submit">
                {projetoEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

<div className="projetos-tabela">
  <div className="projetos-tabela-header">
    <div>
      <h2>Projetos cadastrados</h2>
      <span>
        {projetosFiltrados.length}{' '}
        {projetosFiltrados.length === 1
          ? 'projeto encontrado'
          : 'projetos encontrados'}
      </span>
    </div>

    <div className="projetos-pesquisa">
      <input
        type="text"
        placeholder="Pesquisar por nome, cliente ou descrição..."
        value={pesquisa}
        onChange={(event) => setPesquisa(event.target.value)}
      />
    </div>
  </div>

  {projetosFiltrados.length === 0 ? (
    <div className="projetos-vazio">
      <h3>
        {projetos.length === 0
          ? 'Nenhum projeto cadastrado'
          : 'Nenhum projeto encontrado'}
      </h3>

      <p>
        {projetos.length === 0
          ? 'Cadastre um novo projeto para começar.'
          : 'Tente pesquisar por outro nome, cliente ou descrição.'}
      </p>
    </div>
  ) : (
    <div className="projetos-tabela-scroll">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cliente</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {projetosFiltrados.map((projeto) => (
            <tr key={projeto.id}>
              <td>{projeto.nome}</td>

              <td>
                {projeto.cliente?.nome ||
                  clientes.find(
                    (cliente) =>
                      cliente.id ===
                      (projeto.cliente?.id ?? projeto.clienteId)
                  )?.nome ||
                  '-'}
              </td>

              <td>{projeto.descricao || '-'}</td>

              <td>
                <div className="acoes">
                  <button
                    className="botao-editar"
                    onClick={() => editarProjeto(projeto)}
                  >
                    Editar
                  </button>

                  <button
                    className="botao-excluir"
                    onClick={() => excluirProjeto(projeto.id)}
                  >
                    Excluir
                  </button>

                  <button
                    className="botao-abrir"
                    onClick={() =>
                      navigate(`/projetos/${projeto.id}/ambientes`)
                    }
                  >
                    Ambientes
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

export default Projetos
