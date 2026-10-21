import { useEffect, useState } from 'react'
import api from '../services/api'
import './Pagamentos.css'

function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [resumos, setResumos] = useState({})
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [formulario, setFormulario] = useState({
    valor: '',
    dataPagamento: '',
    descricao: '',
    pedidoId: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [respostaPagamentos, respostaPedidos] = await Promise.all([
        api.get('/pagamentos'),
        api.get('/pedidos')
      ])

      setPagamentos(respostaPagamentos.data)
      setPedidos(respostaPedidos.data)

      carregarResumos(respostaPedidos.data)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    }
  }

  async function carregarResumos(listaPedidos) {
    const novosResumos = {}

    for (const pedido of listaPedidos) {
      try {
        const resposta = await api.get(
          `/pagamentos/pedido/${pedido.id}/resumo`
        )

        novosResumos[pedido.id] = resposta.data
      } catch (error) {
        console.error(
          `Erro ao carregar resumo do pedido ${pedido.id}:`,
          error
        )
      }
    }

    setResumos(novosResumos)
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function novoPagamento() {
    setFormulario({
      valor: '',
      dataPagamento: '',
      descricao: '',
      pedidoId: ''
    })

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)

    setFormulario({
      valor: '',
      dataPagamento: '',
      descricao: '',
      pedidoId: ''
    })
  }

  async function salvarPagamento(event) {
    event.preventDefault()

    try {
      const dados = {
        valor: Number(formulario.valor),
        dataPagamento: formulario.dataPagamento
          ? new Date(formulario.dataPagamento).toISOString()
          : null,
        descricao: formulario.descricao,
        status: 'PAGO',
        pedidoId: Number(formulario.pedidoId)
      }

      await api.post('/pagamentos', dados)

      alert('Pagamento registrado com sucesso!')

      cancelarFormulario()
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao registrar pagamento.'

      alert(mensagem)
    }
  }

  function encontrarPedido(id) {
    return pedidos.find(
      (pedido) => Number(pedido.id) === Number(id)
    )
  }

  function encontrarResumo(id) {
    return resumos[id]
  }

  function textoSituacao(situacao) {
    switch (situacao) {
      case 'PENDENTE':
        return 'Pendente'

      case 'PARCIALMENTE_PAGO':
        return 'Parcialmente pago'

      case 'PAGO':
        return 'Pago'

      default:
        return situacao
    }
  }

  function formatarData(data) {
    if (!data) return '-'

    return new Date(data).toLocaleDateString('pt-BR')
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <div className="pagamentos">

      <div className="pagamentos-header">
        <div>
          <h1>Pagamentos</h1>
          <p>Controle dos pagamentos dos pedidos</p>
        </div>

        <button
          className="botao-novo"
          onClick={novoPagamento}
        >
          Novo pagamento
        </button>
      </div>

      {mostrarFormulario && (
        <div className="pagamento-formulario">

          <h2>Novo pagamento</h2>

          <form onSubmit={salvarPagamento}>

            <div>
              <label>Pedido</label>

              <select
                name="pedidoId"
                value={formulario.pedidoId}
                onChange={alterarCampo}
                required
              >
                <option value="">
                  Selecione um pedido
                </option>

                {pedidos
                  .filter(
                    (pedido) =>
                      pedido.status !== 'CANCELADO'
                  )
                  .map((pedido) => (
                    <option
                      key={pedido.id}
                      value={pedido.id}
                    >
                      Pedido #{pedido.id}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label>Valor</label>

              <input
                type="number"
                name="valor"
                value={formulario.valor}
                onChange={alterarCampo}
                min="0.01"
                step="0.01"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label>Data do pagamento</label>

              <input
                type="datetime-local"
                name="dataPagamento"
                value={formulario.dataPagamento}
                onChange={alterarCampo}
              />
            </div>

            <div>
              <label>Descrição</label>

              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                placeholder="Ex.: Entrada do pedido"
                rows="3"
              />
            </div>

            <p className="aviso-pagamento">
              O pagamento será registrado como PAGO.
              Antes da entrega, o sistema permite pagar
              no máximo 30% do valor do pedido.
            </p>

            <div className="formulario-botoes">

              <button
                type="button"
                onClick={cancelarFormulario}
              >
                Cancelar
              </button>

              <button type="submit">
                Registrar pagamento
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="pagamentos-resumos">

        {pedidos.map((pedido) => {
          const resumo = encontrarResumo(pedido.id)

          if (!resumo) return null

          return (
            <div
              className="resumo-card"
              key={pedido.id}
            >
              <h2>Pedido #{pedido.id}</h2>

              <div className="resumo-itens">

                <div>
                  <span>Valor do pedido</span>
                  <strong>
                    {formatarValor(resumo.valorPedido)}
                  </strong>
                </div>

                <div>
                  <span>Entrada (30%)</span>
                  <strong>
                    {formatarValor(resumo.valorEntrada)}
                  </strong>
                </div>

                <div>
                  <span>Valor pago</span>
                  <strong>
                    {formatarValor(resumo.valorPago)}
                  </strong>
                </div>

                <div>
                  <span>Valor restante</span>
                  <strong>
                    {formatarValor(resumo.valorRestante)}
                  </strong>
                </div>

                <div>
                  <span>Situação</span>
                  <strong>
                    {textoSituacao(resumo.situacao)}
                  </strong>
                </div>

              </div>
            </div>
          )
        })}

      </div>

      <div className="pagamentos-tabela">

        <table>

          <thead>
            <tr>
              <th>Pagamento</th>
              <th>Pedido</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {pagamentos.map((pagamento) => {

              const pedido = encontrarPedido(
                pagamento.pedidoId
              )

              return (
                <tr key={pagamento.id}>

                  <td>
                    #{pagamento.id}
                  </td>

                  <td>
                    {pedido
                      ? `Pedido #${pedido.id}`
                      : `Pedido #${pagamento.pedidoId}`}
                  </td>

                  <td>
                    {formatarValor(pagamento.valor)}
                  </td>

                  <td>
                    {formatarData(
                      pagamento.dataPagamento
                    )}
                  </td>

                  <td>
                    {pagamento.descricao || '-'}
                  </td>

                  <td>
                    {pagamento.status === 'PAGO'
                      ? 'Pago'
                      : pagamento.status}
                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Pagamentos