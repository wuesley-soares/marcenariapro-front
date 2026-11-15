import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

import api from '../services/api'
import './Dashboard.css'

const CORES_STATUS = {
  PENDENTE: '#F59E0B',
  APROVADO: '#2F6FED',
  ENTREGUE: '#16A34A',
  CANCELADO: '#DC2626',
  AGUARDANDO: '#F59E0B',
  EM_PRODUCAO: '#2F6FED',
  PRONTO: '#16A34A',
  PARCIALMENTE_PAGO: '#8B5CF6',
  PAGO: '#16A34A'
}

const NOMES_STATUS = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  AGUARDANDO: 'Aguardando',
  EM_PRODUCAO: 'Em produção',
  PRONTO: 'Pronto',
  PARCIALMENTE_PAGO: 'Parcialmente pago',
  PAGO: 'Pago'
}

const CORES_GRAFICO = [
  '#2F6FED',
  '#16A34A',
  '#F59E0B',
  '#DC2626',
  '#8B5CF6',
  '#64748B'
]

function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [pedidosStatus, setPedidosStatus] = useState([])
  const [estoqueBaixo, setEstoqueBaixo] = useState([])
  const [vendasMensais, setVendasMensais] = useState([])
  const [recebimentosMensais, setRecebimentosMensais] = useState([])
  const [pedidosMensais, setPedidosMensais] = useState([])
  const [producaoStatus, setProducaoStatus] = useState([])
  const [materiaisSaidas, setMateriaisSaidas] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDashboard() {
      setCarregando(true)

      const requisicoes = [
        api.get('/relatorios/resumo'),
        api.get('/relatorios/pedidos-status'),
        api.get('/relatorios/estoque'),
        api.get('/relatorios/vendas-mensais'),
        api.get('/relatorios/recebimentos-mensais'),
        api.get('/relatorios/pedidos-mensais'),
        api.get('/relatorios/producao'),
        api.get('/relatorios/materiais-saidas'),
        api.get('/relatorios/financeiro')
      ]

      const resultados = await Promise.allSettled(requisicoes)

      const obterDados = (indice) => {
        if (resultados[indice].status === 'fulfilled') {
          return resultados[indice].value.data || []
        }

        console.error(
          `Erro ao carregar relatório ${indice}:`,
          resultados[indice].reason
        )
        return []
      }

      if (resultados[0].status === 'fulfilled') {
        setResumo(resultados[0].value.data)
      } else {
        console.error('Erro ao carregar resumo:', resultados[0].reason)
      }

      setPedidosStatus(obterDados(1))
      setEstoqueBaixo(obterDados(2))
      setVendasMensais(obterDados(3))
      setRecebimentosMensais(obterDados(4))
      setPedidosMensais(obterDados(5))
      setProducaoStatus(obterDados(6))
      setMateriaisSaidas(obterDados(7))
      setFinanceiro(obterDados(8))

      setCarregando(false)
    }

    carregarDashboard()
  }, [])

  function moeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function numero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR')
  }

  function nomeStatus(status) {
    return NOMES_STATUS[status] || String(status || '').replaceAll('_', ' ')
  }

  function nomeMes(mes) {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]

    return meses[Number(mes) - 1] || String(mes)
  }

  function criarChaveMes(item) {
    return `${item.ano}-${String(item.mes).padStart(2, '0')}`
  }

  function montarDadosMensais() {
    const agrupado = {}

    function adicionar(registros, campo) {
      registros.forEach((item) => {
        const chave = criarChaveMes(item)

        if (!agrupado[chave]) {
          agrupado[chave] = {
            chave,
            ano: Number(item.ano),
            mes: Number(item.mes),
            vendas: 0,
            recebimentos: 0,
            pedidos: 0
          }
        }

        agrupado[chave][campo] = Number(
          campo === 'pedidos' ? item.quantidade : item.valor
        ) || 0
      })
    }

    adicionar(vendasMensais, 'vendas')
    adicionar(recebimentosMensais, 'recebimentos')
    adicionar(pedidosMensais, 'pedidos')

    return Object.values(agrupado)
      .sort((a, b) => a.chave.localeCompare(b.chave))
      .slice(-12)
      .map((item) => ({
        ...item,
        periodo: `${nomeMes(item.mes)}/${String(item.ano).slice(-2)}`
      }))
  }

  const dadosMensais = montarDadosMensais()

  const dadosPizza = pedidosStatus
    .filter((item) => Number(item.quantidade) > 0)
    .map((item) => ({
      name: nomeStatus(item.status),
      value: Number(item.quantidade),
      status: item.status
    }))

  const dadosPedidos = pedidosStatus.map((item) => ({
    status: nomeStatus(item.status),
    quantidade: Number(item.quantidade || 0),
    fill: CORES_STATUS[item.status] || '#64748B'
  }))

  const dadosProducao = producaoStatus.map((item) => ({
    status: nomeStatus(item.status),
    quantidade: Number(item.quantidade || 0),
    fill: CORES_STATUS[item.status] || '#64748B'
  }))

  const dadosEstoque = estoqueBaixo
    .map((item) => ({
      material: item.material,
      atual: Number(item.quantidadeAtual || 0),
      minimo: Number(item.estoqueMinimo || 0)
    }))
    .slice(0, 8)

  const dadosSaidas = materiaisSaidas
    .map((item) => ({
      material: item.material,
      quantidade: Number(item.quantidadeSaida || 0)
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 8)

  const dadosContasReceber = [
    {
      status: 'Pendente',
      quantidade: financeiro.filter(
        (item) => item.situacao === 'PENDENTE'
      ).length,
      fill: '#F59E0B'
    },
    {
      status: 'Parcialmente pago',
      quantidade: financeiro.filter(
        (item) => item.situacao === 'PARCIALMENTE_PAGO'
      ).length,
      fill: '#8B5CF6'
    },
    {
      status: 'Pago',
      quantidade: financeiro.filter(
        (item) => item.situacao === 'PAGO'
      ).length,
      fill: '#16A34A'
    }
  ]

  const totalPedidosStatus = pedidosStatus.reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
  )

  const percentualRecebido =
    resumo && Number(resumo.valorTotalVendas) > 0
      ? Math.min(
          100,
          (Number(resumo.valorTotalRecebido || 0) /
            Number(resumo.valorTotalVendas)) * 100
        )
      : 0

  if (carregando) {
    return (
      <div className="dashboard-carregando">
        <div className="dashboard-spinner" />
        <p>Carregando indicadores do MarcenariaPro...</p>
      </div>
    )
  }

  if (!resumo) {
    return (
      <div className="dashboard-erro">
        <h2>Não foi possível carregar o dashboard</h2>
        <p>Verifique sua conexão com o servidor e tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-subtitulo">VISÃO GERAL</span>
          <h1>Dashboard</h1>
          <p>Acompanhe os indicadores da sua marcenaria.</p>
        </div>

        <div className="dashboard-atualizacao">
          <span className="dashboard-ponto" />
          Dados do sistema
        </div>
      </header>

      {/* INDICADORES GERAIS */}
      <section className="dashboard-indicadores">
        {[
          {
            titulo: 'Clientes',
            valor: resumo.totalClientes,
            legenda: 'CADASTRO',
            icone: '♙',
            cor: 'azul',
            descricao: 'Clientes cadastrados'
          },
          {
            titulo: 'Projetos',
            valor: resumo.totalProjetos,
            legenda: 'PROJETOS',
            icone: '▤',
            cor: 'roxo',
            descricao: 'Projetos cadastrados'
          },
          {
            titulo: 'Orçamentos',
            valor: resumo.totalOrcamentos,
            legenda: 'COMERCIAL',
            icone: '▧',
            cor: 'laranja',
            descricao: 'Orçamentos registrados'
          },
          {
            titulo: 'Pedidos',
            valor: resumo.totalPedidos,
            legenda: 'COMERCIAL',
            icone: '▣',
            cor: 'verde',
            descricao: 'Pedidos registrados'
          },
          {
            titulo: 'Em produção',
            valor: resumo.pedidosEmProducao,
            legenda: 'PRODUÇÃO',
            icone: '⚙',
            cor: 'azul',
            descricao: 'Pedidos em fabricação'
          },
          {
            titulo: 'Pedidos concluídos',
            valor: resumo.pedidosConcluidos,
            legenda: 'CONCLUÍDOS',
            icone: '✓',
            cor: 'verde',
            descricao: 'Pedidos concluídos'
          }
        ].map((item) => (
          <div className="indicador-card" key={item.titulo}>
            <div className="indicador-topo">
              <span className={`indicador-icone ${item.cor}`}>
                {item.icone}
              </span>
              <span className="indicador-legenda">{item.legenda}</span>
            </div>
            <span className="indicador-titulo">{item.titulo}</span>
            <strong>{numero(item.valor)}</strong>
            <small>{item.descricao}</small>
          </div>
        ))}
      </section>

      {/* RESUMO FINANCEIRO */}
      <section className="dashboard-financeiro">
        <div className="financeiro-card financeiro-vendas">
          <div className="financeiro-icone">R$</div>
          <div>
            <span>Valor total de vendas</span>
            <strong>{moeda(resumo.valorTotalVendas)}</strong>
            <small>Volume total registrado</small>
          </div>
        </div>

        <div className="financeiro-card financeiro-recebido">
          <div className="financeiro-icone">✓</div>
          <div>
            <span>Valor recebido</span>
            <strong>{moeda(resumo.valorTotalRecebido)}</strong>
            <small>Pagamentos efetivamente recebidos</small>
          </div>
        </div>

        <div className="financeiro-card financeiro-progresso">
          <div className="financeiro-progresso-topo">
            <span>Recebimento sobre vendas</span>
            <strong>{percentualRecebido.toFixed(1)}%</strong>
          </div>
          <div className="financeiro-barra">
            <div style={{ width: `${percentualRecebido}%` }} />
          </div>
          <small>Percentual recebido em relação às vendas.</small>
        </div>
      </section>

      {/* EVOLUÇÃO FINANCEIRA */}
      <section className="dashboard-secao">
        <div className="dashboard-secao-titulo">
          <div>
            <h2>Desempenho financeiro</h2>
            <p>Evolução mensal das vendas e dos recebimentos</p>
          </div>
          <span className="bloco-etiqueta">FINANCEIRO</span>
        </div>

        <div className="dashboard-graficos">
          <article className="dashboard-bloco">
            <div className="bloco-cabecalho">
              <div>
                <h3>Vendas e recebimentos por mês</h3>
                <p>Comparativo dos valores registrados</p>
              </div>
            </div>

            {dadosMensais.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <LineChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" />
                  <YAxis
                    tickFormatter={(valor) =>
                      `R$ ${Number(valor).toLocaleString('pt-BR')}`
                    }
                    width={85}
                  />
                  <Tooltip
                    formatter={(valor) => moeda(valor)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="vendas"
                    name="Vendas"
                    stroke="#2F6FED"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="recebimentos"
                    name="Recebimentos"
                    stroke="#16A34A"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="grafico-vazio">Não há dados mensais disponíveis.</p>
            )}
          </article>

          <article className="dashboard-bloco">
            <div className="bloco-cabecalho">
              <div>
                <h3>Pedidos por mês</h3>
                <p>Quantidade de pedidos registrados</p>
              </div>
            </div>

            {dadosMensais.some((item) => item.pedidos > 0) ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(valor) => [`${valor} pedido(s)`, 'Quantidade']}
                  />
                  <Bar
                    dataKey="pedidos"
                    name="Pedidos"
                    fill="#2F6FED"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="grafico-vazio">Não há dados mensais disponíveis.</p>
            )}
          </article>
        </div>
      </section>

      {/* PEDIDOS */}
      <section className="dashboard-secao">
        <div className="dashboard-secao-titulo">
          <div>
            <h2>Acompanhamento de pedidos</h2>
            <p>Distribuição e quantidade de pedidos por situação</p>
          </div>
          <span className="bloco-etiqueta">COMERCIAL</span>
        </div>

        <div className="dashboard-graficos">
          <article className="dashboard-bloco">
            <div className="bloco-cabecalho">
              <div>
                <h3>Distribuição dos pedidos</h3>
                <p>Participação de cada situação</p>
              </div>
            </div>

            {dadosPizza.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {dadosPizza.map((item, index) => (
                        <Cell
                          key={item.status}
                          fill={
                            CORES_STATUS[item.status] ||
                            CORES_GRAFICO[index % CORES_GRAFICO.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(valor) => [`${valor} pedido(s)`, 'Quantidade']}
                    />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pizza-total">
                  <strong>{numero(totalPedidosStatus)}</strong>
                  <span>Pedidos no relatório</span>
                </div>
              </>
            ) : (
              <p className="grafico-vazio">Nenhum pedido encontrado.</p>
            )}
          </article>

          <article className="dashboard-bloco">
            <div className="bloco-cabecalho">
              <div>
                <h3>Pedidos por situação</h3>
                <p>Quantidade em cada etapa</p>
              </div>
            </div>

            {dadosPedidos.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={dadosPedidos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(valor) => [`${valor} pedido(s)`, 'Quantidade']}
                  />
                  <Bar dataKey="quantidade" name="Pedidos" radius={[6, 6, 0, 0]}>
                    {dadosPedidos.map((item) => (
                      <Cell key={item.status} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="grafico-vazio">Nenhum pedido encontrado.</p>
            )}
          </article>
        </div>
      </section>

      {/* PRODUÇÃO */}
      <section className="dashboard-secao">
        <div className="dashboard-secao-titulo">
          <div>
            <h2>Acompanhamento da produção</h2>
            <p>Quantidade de registros em cada etapa produtiva</p>
          </div>
          <span className="bloco-etiqueta">PRODUÇÃO</span>
        </div>

        <article className="dashboard-bloco">
          {dadosProducao.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosProducao}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(valor) => [`${valor}`, 'Quantidade']}
                />
                <Bar
                  dataKey="quantidade"
                  name="Registros"
                  radius={[6, 6, 0, 0]}
                >
                  {dadosProducao.map((item) => (
                    <Cell key={item.status} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="grafico-vazio">Não há dados de produção disponíveis.</p>
          )}
        </article>
      </section>

      {/* ESTOQUE */}
      <section className="dashboard-secao">
        <div className="dashboard-secao-titulo">
          <div>
            <h2>Controle de estoque</h2>
            <p>Materiais com mais saídas e materiais abaixo do mínimo</p>
          </div>
          <span className="bloco-etiqueta">ESTOQUE</span>
        </div>

        <div className="dashboard-graficos">
          <article className="dashboard-bloco">
            <div className="bloco-cabecalho">
              <div>
                <h3>Materiais com mais saídas</h3>
                <p>Quantidade total registrada em movimentações de saída</p>
              </div>
            </div>

            {dadosSaidas.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dadosSaidas}
                  layout="vertical"
                  margin={{ left: 15, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="material"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="quantidade"
                    name="Quantidade de saídas"
                    fill="#2F6FED"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="grafico-vazio">Não há movimentações de saída disponíveis.</p>
            )}
          </article>

          <article className="dashboard-bloco">
            <div className="bloco-cabecalho">
              <div>
                <h3>Atenção ao estoque</h3>
                <p>Quantidade atual comparada ao estoque mínimo</p>
              </div>
              <span className="estoque-contador">
                {estoqueBaixo.length} material(is)
              </span>
            </div>

            {dadosEstoque.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={dadosEstoque}
                    margin={{ top: 10, right: 10, left: 0, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="material"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={65}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="atual"
                      name="Quantidade atual"
                      fill="#2F6FED"
                    />
                    <Bar
                      dataKey="minimo"
                      name="Estoque mínimo"
                      fill="#F59E0B"
                    />
                  </BarChart>
                </ResponsiveContainer>

                <div className="estoque-alertas">
                  {dadosEstoque.map((item, index) => (
                    <div
                      className="estoque-alerta-item"
                      key={`${item.material}-${index}`}
                    >
                      <div>
                        <strong>{item.material}</strong>
                        <span>
                          Atual: {numero(item.atual)} | Mínimo: {numero(item.minimo)}
                        </span>
                      </div>
                      <span className="estoque-alerta-status">Estoque baixo</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="estoque-sem-alertas">
                <span className="estoque-sem-alertas-icone">✓</span>
                <div>
                  <strong>Estoque em situação normal</strong>
                  <p>Nenhum material com estoque baixo foi informado.</p>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* CONTAS A RECEBER */}
      <section className="dashboard-secao">
        <div className="dashboard-secao-titulo">
          <div>
            <h2>Contas a receber</h2>
            <p>Situação financeira dos pedidos cadastrados</p>
          </div>
          <span className="bloco-etiqueta">FINANCEIRO</span>
        </div>

        <article className="dashboard-bloco">
          {financeiro.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={dadosContasReceber}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(valor) => [`${valor} pedido(s)`, 'Quantidade']}
                />
                <Bar
                  dataKey="quantidade"
                  name="Pedidos"
                  radius={[6, 6, 0, 0]}
                >
                  {dadosContasReceber.map((item) => (
                    <Cell key={item.status} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="grafico-vazio">Não há informações financeiras por pedido.</p>
          )}
        </article>
      </section>

      <footer className="dashboard-footer">
        MarcenariaPro · Painel de gestão
      </footer>
    </div>
  )
}

export default Dashboard