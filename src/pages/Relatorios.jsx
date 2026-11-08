import { useEffect, useState } from 'react'
import api from '../services/api'
import './Relatorios.css'

function Relatorios() {
  const [resumo, setResumo] = useState(null)
  const [estoque, setEstoque] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [producao, setProducao] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [assistencias, setAssistencias] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [periodo, setPeriodo] = useState('todos')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [filtroAplicado, setFiltroAplicado] = useState({
    inicio: '',
    fim: ''
  })

  function formatarDataLocal(data) {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')

    return `${ano}-${mes}-${dia}`
  }

  function obterPeriodo(dias) {
    const hoje = new Date()
    const dataInicio = new Date()

    dataInicio.setDate(hoje.getDate() - (dias - 1))

    return {
      inicio: formatarDataLocal(dataInicio),
      fim: formatarDataLocal(hoje)
    }
  }

  async function carregarRelatorios(filtro = filtroAplicado) {
    setCarregando(true)
    setErro('')

    const temPeriodo = Boolean(filtro.inicio && filtro.fim)

    const configuracao = temPeriodo
      ? { params: { inicio: filtro.inicio, fim: filtro.fim } }
      : {}

    const requisicoes = [
      {
        nome: 'resumo',
        url: '/relatorios/resumo',
        setter: setResumo,
        config: configuracao
      },
      {
        nome: 'estoque',
        url: '/relatorios/estoque',
        setter: setEstoque,
        config: {}
      },
      {
        nome: 'financeiro',
        url: '/relatorios/financeiro',
        setter: setFinanceiro,
        config: configuracao
      },
      {
        nome: 'produção',
        url: '/relatorios/producao',
        setter: setProducao,
        config: configuracao
      },
      {
        nome: 'pedidos',
        url: '/relatorios/pedidos-status',
        setter: setPedidos,
        config: configuracao
      },
      {
        nome: 'assistências',
        url: '/relatorios/assistencias-status',
        setter: setAssistencias,
        config: configuracao
      }
    ]

    try {
      const resultados = await Promise.allSettled(
        requisicoes.map((item) =>
          api.get(item.url, item.config)
        )
      )

      const falhas = []

      resultados.forEach((resultado, indice) => {
        if (resultado.status === 'fulfilled') {
          requisicoes[indice].setter(resultado.value.data)
        } else {
          falhas.push(requisicoes[indice].nome)

          console.error(
            `Erro ao carregar relatório de ${requisicoes[indice].nome}:`,
            resultado.reason
          )
        }
      })

      if (falhas.length > 0) {
        setErro(`Não foi possível carregar: ${falhas.join(', ')}.`)
      }
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarRelatorios({
      inicio: '',
      fim: ''
    })
  }, [])

  function selecionarPeriodo(dias) {
    const novoPeriodo = obterPeriodo(dias)

    setPeriodo(String(dias))
    setInicio(novoPeriodo.inicio)
    setFim(novoPeriodo.fim)
    setFiltroAplicado(novoPeriodo)

    carregarRelatorios(novoPeriodo)
  }

  function aplicarPeriodoPersonalizado() {
    if (!inicio || !fim) {
      setErro('Informe a data inicial e a data final.')
      return
    }

    if (inicio > fim) {
      setErro('A data inicial não pode ser maior que a data final.')
      return
    }

    const novoPeriodo = { inicio, fim }

    setPeriodo('personalizado')
    setFiltroAplicado(novoPeriodo)

    carregarRelatorios(novoPeriodo)
  }

  function limparPeriodo() {
    const periodoVazio = {
      inicio: '',
      fim: ''
    }

    setPeriodo('todos')
    setInicio('')
    setFim('')
    setFiltroAplicado(periodoVazio)

    carregarRelatorios(periodoVazio)
  }

  function valorMonetario(valor) {
    return Number(valor ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function numero(valor) {
    return Number(valor ?? 0).toLocaleString('pt-BR')
  }

  function percentual(valor, total) {
    if (!total) return 0

    return Math.round((Number(valor || 0) / total) * 100)
  }

  function classeStatus(status) {
    const texto = String(status || '').toUpperCase()

    if (texto.includes('PARCIAL')) {
      return 'relatorios-status-andamento'
    }

    if (
      texto.includes('PAGO') ||
      texto.includes('CONCLUID') ||
      texto.includes('ENTREGUE') ||
      texto.includes('PRONTO') ||
      texto.includes('APROVADO')
    ) {
      return 'relatorios-status-sucesso'
    }

    if (
      texto.includes('CANCEL') ||
      texto.includes('RECUS') ||
      texto.includes('ATRAS') ||
      texto.includes('BAIXO')
    ) {
      return 'relatorios-status-alerta'
    }

    if (texto.includes('PRODUCAO')) {
      return 'relatorios-status-andamento'
    }

    return 'relatorios-status-pendente'
  }

  function renderStatus(dados) {
    if (!dados?.length) {
      return (
        <p className="relatorios-vazio">
          Nenhum dado disponível.
        </p>
      )
    }

    const total = dados.reduce(
      (soma, item) => soma + Number(item.quantidade || 0),
      0
    )

    return (
      <div className="relatorios-status-lista">
        {dados.map((item, indice) => {
          const quantidade = Number(item.quantidade || 0)
          const porcentagem = percentual(quantidade, total)

          return (
            <div
              className="relatorios-status-item"
              key={item.status ?? indice}
            >
              <div className="relatorios-status-info">
                <span
                  className={`relatorios-status-ponto ${classeStatus(item.status)}`}
                />

                <span>
                  {String(item.status || '').replaceAll('_', ' ')}
                </span>

                <strong>{numero(quantidade)}</strong>
              </div>

              <div className="relatorios-barra">
                <div
                  className={`relatorios-barra-preenchimento ${classeStatus(item.status)}`}
                  style={{ width: `${porcentagem}%` }}
                />
              </div>

              <small>{porcentagem}% do total</small>
            </div>
          )
        })}
      </div>
    )
  }

  if (carregando && resumo === null) {
    return (
      <div className="relatorios-page">
        <div className="relatorios-carregando">
          <div className="relatorios-spinner" />
          <p>Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relatorios-page">
      <header className="relatorios-header">
        <div>
          <span className="relatorios-eyebrow">
            GESTÃO E ANÁLISE
          </span>

          <h1>Relatórios</h1>

          <p>
            Visão geral dos resultados e da operação da marcenaria.
          </p>
        </div>

        <button
          className="relatorios-atualizar"
          onClick={() => carregarRelatorios(filtroAplicado)}
          disabled={carregando}
        >
          {carregando ? 'Atualizando...' : '↻ Atualizar dados'}
        </button>
      </header>

      {erro && (
        <div className="relatorios-alerta">
          {erro}
        </div>
      )}

      <section className="relatorios-filtros">
        <div className="relatorios-filtros-topo">
          <div>
            <h2>Filtrar por período</h2>
            <p>
              Selecione o intervalo para consultar os indicadores.
            </p>
          </div>
        </div>

        <div className="relatorios-filtros-opcoes">
          <button
            type="button"
            className={periodo === 'todos' ? 'ativo' : ''}
            onClick={limparPeriodo}
            disabled={carregando}
          >
            Todo o período
          </button>

          <button
            type="button"
            className={periodo === '7' ? 'ativo' : ''}
            onClick={() => selecionarPeriodo(7)}
            disabled={carregando}
          >
            Últimos 7 dias
          </button>

          <button
            type="button"
            className={periodo === '30' ? 'ativo' : ''}
            onClick={() => selecionarPeriodo(30)}
            disabled={carregando}
          >
            Últimos 30 dias
          </button>
        </div>

        <div className="relatorios-filtros-personalizado">
          <div className="relatorios-data-campo">
            <label htmlFor="relatorio-inicio">
              Data inicial
            </label>

            <input
              id="relatorio-inicio"
              type="date"
              value={inicio}
              onChange={(e) => {
                setInicio(e.target.value)
                setPeriodo('personalizado')
              }}
            />
          </div>

          <div className="relatorios-data-campo">
            <label htmlFor="relatorio-fim">
              Data final
            </label>

            <input
              id="relatorio-fim"
              type="date"
              value={fim}
              min={inicio || undefined}
              onChange={(e) => {
                setFim(e.target.value)
                setPeriodo('personalizado')
              }}
            />
          </div>

          <button
            type="button"
            className="relatorios-aplicar-filtro"
            onClick={aplicarPeriodoPersonalizado}
            disabled={carregando}
          >
            Aplicar período
          </button>

          <button
            type="button"
            className="relatorios-limpar-filtro"
            onClick={limparPeriodo}
            disabled={carregando}
          >
            Limpar
          </button>
        </div>

        {filtroAplicado.inicio && filtroAplicado.fim && (
          <p className="relatorios-periodo-aplicado">
            Período aplicado: {filtroAplicado.inicio.split('-').reverse().join('/')}
            {' até '}
            {filtroAplicado.fim.split('-').reverse().join('/')}
          </p>
        )}
      </section>

      <section className="relatorios-secao">
        <div className="relatorios-secao-titulo">
          <div>
            <h2>Visão geral</h2>
            <p>Principais números registrados no sistema</p>
          </div>
        </div>

        <div className="relatorios-cards">
          <article className="relatorios-card">
            <div className="relatorios-card-topo">
              <span className="relatorios-card-icone">♙</span>
              <span className="relatorios-card-legenda">CADASTRO</span>
            </div>

            <span className="relatorios-card-titulo">Clientes</span>
            <strong>{numero(resumo?.totalClientes)}</strong>
            <small>Clientes cadastrados</small>
          </article>

          <article className="relatorios-card">
            <div className="relatorios-card-topo">
              <span className="relatorios-card-icone">▤</span>
              <span className="relatorios-card-legenda">PROJETOS</span>
            </div>

            <span className="relatorios-card-titulo">Projetos</span>
            <strong>{numero(resumo?.totalProjetos)}</strong>
            <small>Projetos registrados</small>
          </article>

          <article className="relatorios-card">
            <div className="relatorios-card-topo">
              <span className="relatorios-card-icone">▧</span>
              <span className="relatorios-card-legenda">COMERCIAL</span>
            </div>

            <span className="relatorios-card-titulo">Orçamentos</span>
            <strong>{numero(resumo?.totalOrcamentos)}</strong>
            <small>Orçamentos cadastrados</small>
          </article>

          <article className="relatorios-card">
            <div className="relatorios-card-topo">
              <span className="relatorios-card-icone">▣</span>
              <span className="relatorios-card-legenda">VENDAS</span>
            </div>

            <span className="relatorios-card-titulo">Pedidos</span>
            <strong>{numero(resumo?.totalPedidos)}</strong>
            <small>Pedidos registrados</small>
          </article>
        </div>
      </section>

      <section className="relatorios-secao">
        <div className="relatorios-secao-titulo">
          <div>
            <h2>Desempenho operacional</h2>
            <p>
              Acompanhamento de produção, pedidos e assistência técnica
            </p>
          </div>
        </div>

        <div className="relatorios-cards relatorios-cards-menores">
          <article className="relatorios-indicador">
            <span>Pedidos em produção</span>
            <strong>{numero(resumo?.pedidosEmProducao)}</strong>
            <small>Registros em produção</small>
          </article>

          <article className="relatorios-indicador">
            <span>Pedidos concluídos</span>
            <strong>{numero(resumo?.pedidosConcluidos)}</strong>
            <small>Prontos ou entregues</small>
          </article>

          <article className="relatorios-indicador">
            <span>Assistências técnicas</span>
            <strong>{numero(resumo?.totalAssistencias)}</strong>
            <small>Total de atendimentos</small>
          </article>
        </div>

        <div className="relatorios-grid">
          <article className="relatorios-painel">
            <div className="relatorios-painel-titulo">
              <div>
                <h3>Pedidos por status</h3>
                <p>Distribuição dos pedidos cadastrados</p>
              </div>
            </div>

            {renderStatus(pedidos)}
          </article>

          <article className="relatorios-painel">
            <div className="relatorios-painel-titulo">
              <div>
                <h3>Produção por status</h3>
                <p>Etapas da produção no período</p>
              </div>
            </div>

            {renderStatus(producao)}
          </article>

          <article className="relatorios-painel">
            <div className="relatorios-painel-titulo">
              <div>
                <h3>Assistências por status</h3>
                <p>Situação dos atendimentos técnicos</p>
              </div>
            </div>

            {renderStatus(assistencias)}
          </article>

          <article className="relatorios-painel">
            <div className="relatorios-painel-titulo">
              <div>
                <h3>Estoque baixo</h3>
                <p>Materiais que precisam de atenção</p>
              </div>

              <span className="relatorios-contador">
                {estoque.length}
              </span>
            </div>

            {!estoque.length ? (
              <div className="relatorios-estoque-vazio">
                <span>✓</span>
                <p>Nenhum material abaixo do estoque mínimo.</p>
              </div>
            ) : (
              <div className="relatorios-estoque-lista">
                {estoque.map((item) => (
                  <div
                    className="relatorios-estoque-item"
                    key={item.materialId}
                  >
                    <div>
                      <strong>{item.material}</strong>
                      <span>
                        {item.situacao?.replaceAll('_', ' ')}
                      </span>
                    </div>

                    <div className="relatorios-estoque-quantidades">
                      <span>
                        Atual: <strong>{numero(item.quantidadeAtual)}</strong>
                      </span>

                      <span>
                        Mínimo: <strong>{numero(item.estoqueMinimo)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="relatorios-secao">
        <div className="relatorios-secao-titulo">
          <div>
            <h2>Visão financeira</h2>
            <p>Valores de vendas e pagamentos registrados</p>
          </div>
        </div>

        <div className="relatorios-financeiro-resumo">
          <article>
            <span>Valor total de vendas</span>
            <strong>{valorMonetario(resumo?.valorTotalVendas)}</strong>
            <small>Considerando os pedidos registrados</small>
          </article>

          <article>
            <span>Valor total recebido</span>
            <strong>{valorMonetario(resumo?.valorTotalRecebido)}</strong>
            <small>Pagamentos com status pago</small>
          </article>

          <article>
            <span>Valor restante</span>
            <strong>
              {valorMonetario(
                Number(resumo?.valorTotalVendas || 0) -
                Number(resumo?.valorTotalRecebido || 0)
              )}
            </strong>
            <small>Diferença entre vendas e recebimentos</small>
          </article>
        </div>

        <article className="relatorios-painel relatorios-painel-financeiro">
          <div className="relatorios-painel-titulo">
            <div>
              <h3>Financeiro por pedido</h3>
              <p>Valores pagos e pendentes de cada pedido</p>
            </div>

            <span className="relatorios-contador">
              {financeiro.length} pedidos
            </span>
          </div>

          {!financeiro.length ? (
            <p className="relatorios-vazio">
              Nenhum dado financeiro disponível.
            </p>
          ) : (
            <div className="relatorios-tabela-container">
              <table className="relatorios-tabela">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Valor do pedido</th>
                    <th>Valor pago</th>
                    <th>Valor restante</th>
                    <th>Situação</th>
                  </tr>
                </thead>

                <tbody>
                  {financeiro.map((item) => (
                    <tr key={item.pedidoId}>
                      <td>
                        <strong>#{item.pedidoId}</strong>
                      </td>

                      <td>{valorMonetario(item.valorPedido)}</td>

                      <td className="relatorios-valor-pago">
                        {valorMonetario(item.valorPago)}
                      </td>

                      <td>{valorMonetario(item.valorRestante)}</td>

                      <td>
                        <span
                          className={`relatorios-tag ${classeStatus(item.situacao)}`}
                        >
                          {item.situacao?.replaceAll('_', ' ') || 'Não informada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <footer className="relatorios-rodape">
        Os indicadores apresentam os dados disponíveis no MarcenariaPro no momento da consulta.
      </footer>
    </main>
  )
}

export default Relatorios