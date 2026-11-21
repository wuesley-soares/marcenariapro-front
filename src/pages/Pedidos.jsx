import { useEffect, useState } from 'react'
import api from '../services/api'
import './Pedidos.css'

function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [menuAberto, setMenuAberto] = useState(null)

const [posicaoMenu, setPosicaoMenu] = useState({
  top: 0,
  left: 0
})

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [pedidoEditando, setPedidoEditando] = useState(null)
  const [pesquisa, setPesquisa] = useState('')

const [formulario, setFormulario] = useState({
  status: 'PENDENTE',
  previsaoEntrega: '',
  orcamentoId: ''
})

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [respostaPedidos, respostaOrcamentos] =
        await Promise.all([
          api.get('/pedidos'),
          api.get('/orcamentos')
        ])

      setPedidos(respostaPedidos.data)
      setOrcamentos(respostaOrcamentos.data)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

function alternarMenu(event, id) {
  if (menuAberto === id) {
    setMenuAberto(null)
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()

  const larguraMenu = 155
  const alturaMenu = 105

  let top = rect.bottom + 6

  if (top + alturaMenu > window.innerHeight - 10) {
    top = rect.top - alturaMenu - 6
  }

  let left = rect.right - larguraMenu

  left = Math.max(
    10,
    Math.min(left, window.innerWidth - larguraMenu - 10)
  )

  setPosicaoMenu({ top, left })
  setMenuAberto(id)
}

  function novoPedido() {
    setPedidoEditando(null)

    setFormulario({
      status: 'PENDENTE',
      orcamentoId: ''
    })

    setMostrarFormulario(true)
  }

  function editarPedido(pedido) {
    setPedidoEditando(pedido)

  setFormulario({
  status: pedido.status,
  previsaoEntrega: pedido.previsaoEntrega || '',
  orcamentoId: pedido.orcamentoId
})

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setPedidoEditando(null)

setFormulario({
  status: 'PENDENTE',
  previsaoEntrega: '',
  orcamentoId: ''
})
  }

  async function salvarPedido(event) {
    event.preventDefault()

    try {
   const dados = {
      status: formulario.status,
      previsaoEntrega: formulario.previsaoEntrega,
      orcamentoId: Number(formulario.orcamentoId)
    }

      if (pedidoEditando) {
        await api.put(
          `/pedidos/${pedidoEditando.id}`,
          dados
        )

        alert('Pedido atualizado com sucesso!')
      } else {
        await api.post('/pedidos', dados)

        alert('Pedido cadastrado com sucesso!')
      }

      cancelarFormulario()
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar pedido.'

      alert(mensagem)
    }
  }

  async function excluirPedido(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este pedido?'
    )

    if (!confirmar) {
      return
    }

    try {
      await api.delete(`/pedidos/${id}`)

      alert('Pedido excluído com sucesso!')

      carregarDados()
    } catch (error) {
      console.error('Erro ao excluir pedido:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir pedido.'

      alert(mensagem)
    }
  }

  function encontrarOrcamento(id) {
    return orcamentos.find(
      (orcamento) => Number(orcamento.id) === Number(id)
    )
  }

 function textoStatus(status) {
  switch (status) {
    case 'PENDENTE':
      return 'Pendente'

    case 'APROVADO':
      return 'Aprovado'

    case 'ENTREGUE':
      return 'Entregue'

    case 'CANCELADO':
      return 'Cancelado'

    default:
      return status
  }
}

function classeStatus(status) {
  switch (status) {
    case 'PENDENTE':
      return 'status-pendente'

    case 'APROVADO':
      return 'status-aprovado'

    case 'ENTREGUE':
      return 'status-entregue'

    case 'CANCELADO':
      return 'status-cancelado'

    default:
      return ''
  }
}

const pedidosFiltrados = pedidos.filter((pedido) => {
  const termo = pesquisa.toLowerCase().trim()
  const orcamento = encontrarOrcamento(pedido.orcamentoId)

  return (
    orcamento?.projetoNome?.toLowerCase().includes(termo) ||
    orcamento?.ambienteNome?.toLowerCase().includes(termo) ||
    textoStatus(pedido.status)?.toLowerCase().includes(termo) ||
    String(orcamento?.valor ?? '').includes(termo) ||
    (orcamento
      ? `R$ ${Number(orcamento.valor).toFixed(2)}`.includes(termo)
      : false)
  )
})
  return (
    <div className="pedidos">

      <div className="pedidos-header">

        <div>
          <h1>Pedidos</h1>
          <p>Pedidos cadastrados na marcenaria</p>
        </div>

        <button
          onClick={novoPedido}
          className="botao-novo"
        >
          Novo pedido
        </button>

      </div>

      {mostrarFormulario && (
        <div className="pedido-formulario">

          <h2>
            {pedidoEditando
              ? 'Editar pedido'
              : 'Novo pedido'}
          </h2>

          <form onSubmit={salvarPedido}>

            <div>
              <label>Orçamento</label>

              <select
                name="orcamentoId"
                value={formulario.orcamentoId}
                onChange={alterarCampo}
                required
                disabled={!!pedidoEditando}
              >
                <option value="">
                  Selecione um orçamento
                </option>

                {orcamentos
                  .filter(
                    (orcamento) =>
                      orcamento.status === 'APROVADO' &&
                      (!pedidoEditando ||
                        Number(orcamento.id) ===
                          Number(pedidoEditando.orcamentoId))
                  )
                  .map((orcamento) => (
                    <option
                      key={orcamento.id}
                      value={orcamento.id}
                    >
                      {orcamento.projetoNome || 'Projeto'} -{' '}
                      {orcamento.ambienteNome || 'Ambiente'} -{' '}
                      R$ {Number(orcamento.valor).toFixed(2)}
                    </option>
                  ))}
              </select>
            </div>

<div>
  <label>Status</label>

  <select
    name="status"
    value={formulario.status}
    onChange={alterarCampo}
    required
    disabled={!pedidoEditando}
  >
    <option value="PENDENTE">
      Pendente
    </option>

    {pedidoEditando && (
      <>
        <option value="APROVADO">
          Aprovado
        </option>

        <option value="ENTREGUE">
          Entregue
        </option>

        <option value="CANCELADO">
          Cancelado
        </option>
      </>
    )}
  </select>
</div>

<div>
  <label>Previsão de entrega</label>

  <input
    type="date"
    name="previsaoEntrega"
    value={formulario.previsaoEntrega}
    onChange={alterarCampo}
    min={new Date().toISOString().split('T')[0]}
    required
  />
</div>

            {!pedidoEditando && (
              <p className="aviso-pedido">
                Um novo pedido será criado com o status
                Pendente. O orçamento precisa estar aprovado.
              </p>
            )}

            <div className="formulario-botoes">

              <button
                type="button"
                onClick={cancelarFormulario}
              >
                Cancelar
              </button>

              <button type="submit">
                {pedidoEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="pedidos-tabela">

  <div className="pedidos-tabela-header">
    <div>
      <h2>Pedidos cadastrados</h2>
      <span>
        {pedidosFiltrados.length}{' '}
        {pedidosFiltrados.length === 1
          ? 'pedido encontrado'
          : 'pedidos encontrados'}
      </span>
    </div>

    <div className="pedidos-pesquisa">
      <input
        type="text"
        placeholder="Pesquisar por projeto, ambiente, status ou valor..."
        value={pesquisa}
        onChange={(event) => setPesquisa(event.target.value)}
      />
    </div>
  </div>

  {pedidosFiltrados.length === 0 ? (
    <div className="pedidos-vazio">
      <h3>
        {pedidos.length === 0
          ? 'Nenhum pedido cadastrado'
          : 'Nenhum pedido encontrado'}
      </h3>

      <p>
        {pedidos.length === 0
          ? 'Os pedidos cadastrados aparecerão aqui.'
          : 'Tente pesquisar por outro projeto, ambiente ou status.'}
      </p>
    </div>
  ) : (
    <div className="tabela-container">
      <table>
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Ambiente</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Criação</th>
            <th>Previsão de entrega</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {pedidosFiltrados.map((pedido) => {
            const orcamento = encontrarOrcamento(
              pedido.orcamentoId
            )

            return (
              <tr key={pedido.id}>
                <td>{orcamento?.projetoNome || '-'}</td>

                <td>{orcamento?.ambienteNome || '-'}</td>

                <td>
                  {orcamento
                    ? `R$ ${Number(orcamento.valor).toFixed(2)}`
                    : '-'}
                </td>

                <td>
                    <span className={`pedido-status ${classeStatus(pedido.status)}`}>
                      {textoStatus(pedido.status)}
                    </span>
                  </td>

                <td>
                  {pedido.dataCriacao
                    ? new Date(
                        pedido.dataCriacao
                      ).toLocaleDateString('pt-BR')
                    : '-'}
                </td>

                <td>
                  {pedido.previsaoEntrega
                    ? new Date(
                        `${pedido.previsaoEntrega}T00:00:00`
                      ).toLocaleDateString('pt-BR')
                    : '-'}
                </td>

                
<td>
  <div className="acoes">
    <button
      type="button"
      className="botao-tres-pontos-pedido"
      aria-label={`Mais opções do pedido ${pedido.id}`}
      aria-expanded={menuAberto === pedido.id}
      onClick={(event) => alternarMenu(event, pedido.id)}
    >
      ⋮
    </button>

    {menuAberto === pedido.id && (
      <div
        className="menu-dropdown-pedido"
        style={{
          top: `${posicaoMenu.top}px`,
          left: `${posicaoMenu.left}px`
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMenuAberto(null)
            editarPedido(pedido)
          }}
        >
          <span>✎</span>
          Editar
        </button>

        <button
          type="button"
          className="opcao-excluir"
          onClick={() => {
            setMenuAberto(null)
            excluirPedido(pedido.id)
          }}
        >
          <span>🗑</span>
          Excluir
        </button>
      </div>
    )}
  </div>
</td>

              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )}

</div>

    </div>
  )
}

export default Pedidos