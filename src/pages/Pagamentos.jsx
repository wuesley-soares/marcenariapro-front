
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Pagamentos.css'

function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [resumos, setResumos] = useState({})

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [comprovante, setComprovante] = useState(null)

  const [pesquisa, setPesquisa] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

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
      const [
        respostaPagamentos,
        respostaPedidos,
        respostaOrcamentos
      ] = await Promise.all([
        api.get('/pagamentos'),
        api.get('/pedidos'),
        api.get('/orcamentos')
      ])

      const listaPagamentos = [...respostaPagamentos.data].sort(
  (a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento)
)
      const listaPedidos = respostaPedidos.data
      const listaOrcamentos = respostaOrcamentos.data

      setPagamentos(listaPagamentos)
      setPedidos(listaPedidos)
      setOrcamentos(listaOrcamentos)

      const novosResumos = {}

      await Promise.all(
        listaPedidos.map(async (pedido) => {
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
        })
      )

      setResumos(novosResumos)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
      alert('Erro ao carregar os dados dos pagamentos.')
    }
  }

  async function visualizarComprovante(pagamentoId) {
  const novaAba = window.open('', '_blank')

  if (!novaAba) {
    alert('Permita a abertura de novas abas para visualizar o comprovante.')
    return
  }

  novaAba.document.write('Carregando comprovante...')

  try {
    const resposta = await api.get(
      `/pagamentos/${pagamentoId}/comprovante`,
      { responseType: 'blob' }
    )

    const arquivoUrl = URL.createObjectURL(resposta.data)

    novaAba.location.href = arquivoUrl

    // Mantém a URL disponível enquanto o navegador abre o arquivo.
    setTimeout(() => URL.revokeObjectURL(arquivoUrl), 60000)
  } catch (error) {
    console.error('Erro ao visualizar comprovante:', error)

    novaAba.close()
    alert('Não foi possível abrir o comprovante.')
  }
}

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  function novoPagamento(pedidoId = '') {
  setFormulario({
    valor: '',
    dataPagamento: '',
    descricao: '',
    pedidoId: pedidoId ? String(pedidoId) : ''
  })

  setComprovante(null)
  setMostrarFormulario(true)
}

function cancelarFormulario() {
  setMostrarFormulario(false)
  setComprovante(null)

  setFormulario({
    valor: '',
    dataPagamento: '',
    descricao: '',
    pedidoId: ''
  })
}

  async function salvarPagamento(event) {
  event.preventDefault()

  if (Number(formulario.valor) <= 0) {
    alert('Informe um valor maior que zero.')
    return
  }

  if (!formulario.pedidoId) {
    alert('Selecione um pedido.')
    return
  }

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

    const formData = new FormData()

    formData.append(
      'dados',
      new Blob(
        [JSON.stringify(dados)],
        { type: 'application/json' }
      )
    )

    if (comprovante) {
      formData.append('comprovante', comprovante)
    }

    await api.post('/pagamentos', formData)

    alert('Pagamento registrado com sucesso!')

    cancelarFormulario()
    await carregarDados()
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

  function encontrarOrcamentoDoPedido(pedidoId) {
    const pedido = encontrarPedido(pedidoId)

    if (!pedido) {
      return null
    }

    return orcamentos.find(
      (orcamento) =>
        Number(orcamento.id) === Number(pedido.orcamentoId)
    )
  }

  function nomeProjetoAmbiente(pedidoId) {
    const orcamento = encontrarOrcamentoDoPedido(pedidoId)

    if (!orcamento) {
      return 'Orçamento não encontrado'
    }

    const projeto =
      orcamento.projetoNome || 'Projeto não informado'

    const ambiente =
      orcamento.ambienteNome || 'Ambiente não informado'

    return `${projeto} - ${ambiente}`
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
        return situacao || 'Não informado'
    }
  }

  function classeSituacao(situacao) {
    switch (situacao) {
      case 'PAGO':
        return 'status-pago'

      case 'PARCIALMENTE_PAGO':
        return 'status-parcial'

      case 'PENDENTE':
        return 'status-pendente'

      default:
        return ''
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

  function percentualPago(resumo) {
    if (!resumo || Number(resumo.valorPedido) <= 0) {
      return 0
    }

    const percentual =
      (Number(resumo.valorPago || 0) /
        Number(resumo.valorPedido)) *
      100

    return Math.min(Math.max(percentual, 0), 100)
  }

  function pagamentosDoPedido(pedidoId) {
    return pagamentos.filter(
      (pagamento) =>
        Number(pagamento.pedidoId) === Number(pedidoId)
    )
  }

  const pedidosComResumo = pedidos.filter(
    (pedido) => Boolean(resumos[pedido.id])
  )

  const totalPedidos = pedidosComResumo.reduce(
    (total, pedido) =>
      total + Number(resumos[pedido.id]?.valorPedido || 0),
    0
  )

  const totalRecebido = pedidosComResumo.reduce(
    (total, pedido) =>
      total + Number(resumos[pedido.id]?.valorPago || 0),
    0
  )

  const totalAReceber = pedidosComResumo.reduce(
    (total, pedido) =>
      total + Math.max(
        Number(resumos[pedido.id]?.valorRestante || 0),
        0
      ),
    0
  )

  const pedidosFiltrados = pedidosComResumo.filter((pedido) => {
    const resumo = encontrarResumo(pedido.id)
    const nome = nomeProjetoAmbiente(pedido.id)
    const situacao = resumo?.situacao || ''

    const termo = pesquisa.toLowerCase().trim()

    const correspondePesquisa =
      nome.toLowerCase().includes(termo) ||
      String(pedido.id).includes(termo) ||
      textoSituacao(situacao).toLowerCase().includes(termo) ||
      String(resumo?.valorPedido || '').includes(termo) ||
      String(resumo?.valorPago || '').includes(termo)

    const correspondeStatus =
      filtroStatus === 'TODOS' ||
      situacao === filtroStatus

    return correspondePesquisa && correspondeStatus
  })

  function abrirDetalhes(pedido) {
    setPedidoSelecionado(pedido)
  }

  function fecharDetalhes() {
    setPedidoSelecionado(null)
  }

  const historicoSelecionado = pedidoSelecionado
    ? pagamentosDoPedido(pedidoSelecionado.id)
    : []

  return (
    <div className="pagamentos">

      <div className="pagamentos-header">
        <div>
          <h1>Pagamentos</h1>
          <p>Controle dos pagamentos dos pedidos.</p>
        </div>

        <button
          className="botao-novo"
          onClick={() => novoPagamento()}
        >
          + Novo pagamento
        </button>
      </div>

      <div className="pagamentos-indicadores">

        <div className="indicador-card">
          <div className="indicador-icone icone-pedidos">
            <span>R$</span>
          </div>

          <div>
            <span>Total em pedidos</span>
            <strong>{formatarValor(totalPedidos)}</strong>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone icone-recebido">
            <span>✓</span>
          </div>

          <div>
            <span>Total recebido</span>
            <strong>{formatarValor(totalRecebido)}</strong>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone icone-receber">
            <span>↗</span>
          </div>

          <div>
            <span>Total a receber</span>
            <strong>{formatarValor(totalAReceber)}</strong>
          </div>
        </div>

      </div>

      {mostrarFormulario && (
        <div className="pagamento-formulario">

          <div className="formulario-header">
            <div>
              <h2>Novo pagamento</h2>
              <p>Registre um pagamento recebido de um pedido.</p>
            </div>

            <button
              type="button"
              className="botao-fechar-formulario"
              onClick={cancelarFormulario}
            >
              ×
            </button>
          </div>

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
                      {nomeProjetoAmbiente(pedido.id)}
                      {' — Pedido #'}
                      {pedido.id}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label>Valor do pagamento</label>

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

            <div>
  <label>Comprovante (opcional)</label>

  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
    onChange={(event) => {
      const arquivo = event.target.files?.[0] || null

      if (!arquivo) {
        setComprovante(null)
        return
      }

      const tiposPermitidos = [
        'application/pdf',
        'image/jpeg',
        'image/png'
      ]

      if (!tiposPermitidos.includes(arquivo.type)) {
        alert('Selecione um arquivo PDF, JPG ou PNG.')
        event.target.value = ''
        setComprovante(null)
        return
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        alert('O comprovante deve ter no máximo 5 MB.')
        event.target.value = ''
        setComprovante(null)
        return
      }

      setComprovante(arquivo)
    }}
  />

  {comprovante && (
    <p>
      Arquivo selecionado: {comprovante.name}
    </p>
  )}

  <small>
    Formatos permitidos: PDF, JPG e PNG. Tamanho máximo: 5 MB.
  </small>
</div>

            <p className="aviso-pagamento">
              O pagamento será registrado como recebido.
              O valor de entrada previsto não representa um
              pagamento até que ele seja efetivamente registrado.
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

      <div className="pagamentos-lista">

        <div className="pagamentos-lista-header">
          <div>
            <h2>Pagamentos por pedido</h2>
            <span>
              {pedidosFiltrados.length} pedido(s) encontrado(s)
            </span>
          </div>

          <div className="pagamentos-filtros">

            <input
              type="text"
              placeholder="Pesquisar projeto, ambiente ou pedido..."
              value={pesquisa}
              onChange={(event) =>
                setPesquisa(event.target.value)
              }
            />

            <select
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(event.target.value)
              }
            >
              <option value="TODOS">Todos</option>
              <option value="PAGO">Pago</option>
              <option value="PARCIALMENTE_PAGO">
                Parcialmente pago
              </option>
              <option value="PENDENTE">Pendente</option>
            </select>

          </div>
        </div>

        <div className="pagamentos-cards">

          {pedidosFiltrados.length === 0 ? (
            <div className="pagamentos-vazio">
              <span>Não foram encontrados pedidos.</span>
              <p>
                Tente alterar a pesquisa ou o filtro selecionado.
              </p>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => {
              const resumo = encontrarResumo(pedido.id)
              const percentual = percentualPago(resumo)

              const situacao = resumo.situacao
              const historico = pagamentosDoPedido(pedido.id)

              return (
                <div
                  className="pagamento-pedido-card"
                  key={pedido.id}
                >

                  <div className="pedido-card-header">
                    <div>
                      <span className="pedido-identificacao">
                        Pedido #{pedido.id}
                      </span>

                      <h3>
                        {nomeProjetoAmbiente(pedido.id)}
                      </h3>
                    </div>

                    <span
                      className={`pagamento-status ${classeSituacao(situacao)}`}
                    >
                      {textoSituacao(situacao)}
                    </span>
                  </div>

                  <div className="pedido-valores">

                    <div>
                      <span>Valor do pedido</span>
                      <strong>
                        {formatarValor(resumo.valorPedido)}
                      </strong>
                    </div>

                    <div>
                      <span>Entrada prevista (30%)</span>
                      <strong>
                        {formatarValor(resumo.valorEntrada)}
                      </strong>
                    </div>

                    <div>
                      <span>Valor recebido</span>
                      <strong className="valor-recebido">
                        {formatarValor(resumo.valorPago)}
                      </strong>
                    </div>

                    <div>
                      <span>Valor restante</span>
                      <strong className="valor-restante">
                        {formatarValor(resumo.valorRestante)}
                      </strong>
                    </div>

                  </div>

                  <div className="progresso-container">

                    <div className="progresso-info">
                      <span>Progresso do pagamento</span>
                      <strong>{percentual.toFixed(1)}%</strong>
                    </div>

                    <div className="progresso-fundo">
                      <div
                        className={`progresso-barra ${classeSituacao(situacao)}`}
                        style={{ width: `${percentual}%` }}
                      />
                    </div>

                  </div>

                  <div className="pedido-card-footer">

                    <span>
                      {historico.length}{' '}
                      {historico.length === 1
                        ? 'pagamento registrado'
                        : 'pagamentos registrados'}
                    </span>

                    <div>
                      <button
                        type="button"
                        className="botao-detalhes"
                        onClick={() => abrirDetalhes(pedido)}
                      >
                        Ver detalhes
                      </button>

                      {situacao !== 'PAGO' && (
                        <button
                          type="button"
                          className="botao-registrar"
                          onClick={() => novoPagamento(pedido.id)}
                        >
                          Registrar pagamento
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              )
            })
          )}

        </div>
      </div>

      <div className="pagamentos-historico-geral">

        <div className="historico-header">
          <div>
            <h2>Histórico de pagamentos</h2>
            <span>
              Todos os pagamentos registrados no sistema.
            </span>
          </div>
        </div>

        <div className="pagamentos-tabela">

          <table>
         <thead>
            <tr>
              <th>Pagamento</th>
              <th>Projeto / Ambiente</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Comprovante</th>
            </tr>
          </thead>

            <tbody>
              {pagamentos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="tabela-vazia">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                pagamentos.map((pagamento) => (
                  <tr key={pagamento.id}>
                    <td>#{pagamento.id}</td>

                    <td>
                      {nomeProjetoAmbiente(pagamento.pedidoId)}
                    </td>

                    <td>
                      {formatarValor(pagamento.valor)}
                    </td>

                    <td>
                      {formatarData(pagamento.dataPagamento)}
                    </td>

                    <td>
                      {pagamento.descricao || '-'}
                    </td>

                    <td>
                      <span
                        className={`pagamento-status ${
                          pagamento.status === 'PAGO'
                            ? 'status-pago'
                            : 'status-pendente'
                        }`}
                      >
                        {pagamento.status === 'PAGO'
                          ? 'Pago'
                          : pagamento.status}
                      </span>
                    </td>

                    <td>
                      {pagamento.possuiComprovante ? (
                        <button
                          type="button"
                          className="botao-comprovante"
                          onClick={() => visualizarComprovante(pagamento.id)}
                        >
                          Ver comprovante
                        </button>
                      ) : (
                        <span className="sem-comprovante">Não anexado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>

      {pedidoSelecionado && (
        <div
          className="modal-overlay"
          onClick={fecharDetalhes}
        >
          <div
            className="modal-pagamento"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="modal-pagamento-header">
              <div>
                <span>Pedido #{pedidoSelecionado.id}</span>
                <h2>
                  {nomeProjetoAmbiente(pedidoSelecionado.id)}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharDetalhes}
              >
                ×
              </button>
            </div>

            <div className="modal-resumo">
              {(() => {
                const resumo = encontrarResumo(pedidoSelecionado.id)

                if (!resumo) return null

                return (
                  <>
                    <div>
                      <span>Valor do pedido</span>
                      <strong>
                        {formatarValor(resumo.valorPedido)}
                      </strong>
                    </div>

                    <div>
                      <span>Valor recebido</span>
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
                  </>
                )
              })()}
            </div>

            <div className="modal-historico">
              <h3>Histórico de pagamentos</h3>

              {historicoSelecionado.length === 0 ? (
                <p>Nenhum pagamento registrado para este pedido.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Pagamento</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Comprovante</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historicoSelecionado.map((pagamento) => (
                      <tr key={pagamento.id}>
                        <td>#{pagamento.id}</td>
                        <td>{formatarValor(pagamento.valor)}</td>
                        <td>
                          {formatarData(pagamento.dataPagamento)}
                        </td>
                        <td>{pagamento.descricao || '-'}</td>

                        <td>
                            {pagamento.possuiComprovante ? (
                              <button
                                type="button"
                                className="botao-comprovante"
                                onClick={() => visualizarComprovante(pagamento.id)}
                              >
                                Ver comprovante
                              </button>
                            ) : (
                              <span className="sem-comprovante">Não anexado</span>
                            )}
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-pagamento-acoes">
              {encontrarResumo(pedidoSelecionado.id)?.situacao !== 'PAGO' && (
                <button
                  type="button"
                  className="botao-registrar"
                  onClick={() => {
                    const id = pedidoSelecionado.id
                    fecharDetalhes()
                    novoPagamento(id)
                  }}
                >
                  Registrar pagamento
                </button>
              )}

              <button
                type="button"
                className="botao-fechar-modal"
                onClick={fecharDetalhes}
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Pagamentos
