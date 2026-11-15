
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
  CANCELADO: '#DC2626'
}

const CORES_GRAFICO = [
  '#2F6FED',
  '#16A34A',
  '#F59E0B',
  '#DC2626',
  '#8B5CF6',
  '#64748B'
]

const NOMES_STATUS = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado'
}

function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [pedidosStatus, setPedidosStatus] = useState([])
  const [estoqueBaixo, setEstoqueBaixo] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDashboard() {
      setCarregando(true)

      const resultados = await Promise.allSettled([
        api.get('/relatorios/resumo'),
        api.get('/relatorios/pedidos-status'),
        api.get('/relatorios/estoque')
      ])

      if (resultados[0].status === 'fulfilled') {
        setResumo(resultados[0].value.data)
      } else {
        console.error('Erro ao carregar resumo:', resultados[0].reason)
      }

      if (resultados[1].status === 'fulfilled') {
        setPedidosStatus(resultados[1].value.data || [])
      } else {
        console.error('Erro ao carregar pedidos:', resultados[1].reason)
      }

      if (resultados[2].status === 'fulfilled') {
        setEstoqueBaixo(resultados[2].value.data || [])
      } else {
        console.error('Erro ao carregar estoque:', resultados[2].reason)
      }

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
    return NOMES_STATUS[status] || status
  }

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

  const dadosFinanceiros = resumo
    ? [
        {
          nome: 'Vendas',
          valor: Number(resumo.valorTotalVendas || 0)
        },
        {
          nome: 'Recebido',
          valor: Number(resumo.valorTotalRecebido || 0)
        }
      ]
    : []

  const dadosEstoque = estoqueBaixo
    .map((item) => ({
      material: item.material,
      atual: Number(item.quantidadeAtual || 0),
      minimo: Number(item.estoqueMinimo || 0)
    }))
    .slice(0, 8)

  const totalPedidosStatus = pedidosStatus.reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
  )

  const percentualRecebido = resumo && Number(resumo.valorTotalVendas) > 0
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

      {/* CABEÇALHO */}
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

      {/* INDICADORES */}
      <section className="dashboard-indicadores">

        <div className="indicador-card">
          <div className="indicador-topo">
            <span className="indicador-icone azul">♙</span>
            <span className="indicador-legenda">CADASTRO</span>
          </div>
          <span className="indicador-titulo">Clientes</span>
          <strong>{numero(resumo.totalClientes)}</strong>
          <small>Clientes cadastrados</small>
        </div>

        <div className="indicador-card">
          <div className="indicador-topo">
            <span className="indicador-icone roxo">▤</span>
            <span className="indicador-legenda">PROJETOS</span>
          </div>
          <span className="indicador-titulo">Projetos</span>
          <strong>{numero(resumo.totalProjetos)}</strong>
          <small>Projetos cadastrados</small>
        </div>

        <div className="indicador-card">
          <div className="indicador-topo">
            <span className="indicador-icone laranja">▧</span>
            <span className="indicador-legenda">COMERCIAL</span>
          </div>
          <span className="indicador-titulo">Orçamentos</span>
          <strong>{numero(resumo.totalOrcamentos)}</strong>
          <small>Orçamentos registrados</small>
        </div>

        <div className="indicador-card">
          <div className="indicador-topo">
            <span className="indicador-icone verde">▣</span>
            <span className="indicador-legenda">COMERCIAL</span>
          </div>
          <span className="indicador-titulo">Pedidos</span>
          <strong>{numero(resumo.totalPedidos)}</strong>
          <small>Pedidos registrados</small>
        </div>

        <div className="indicador-card">
          <div className="indicador-topo">
            <span className="indicador-icone azul">⚙</span>
            <span className="indicador-legenda">PRODUÇÃO</span>
          </div>
          <span className="indicador-titulo">Em produção</span>
          <strong>{numero(resumo.pedidosEmProducao)}</strong>
          <small>Pedidos em fabricação</small>
        </div>

        <div className="indicador-card">
          <div className="indicador-topo">
            <span className="indicador-icone verde">✓</span>
            <span className="indicador-legenda">CONCLUÍDOS</span>
          </div>
          <span className="indicador-titulo">Pedidos concluídos</span>
          <strong>{numero(resumo.pedidosConcluidos)}</strong>
          <small>Indicador informado pelo relatório</small>
        </div>

      </section>

      {/* FINANCEIRO */}
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
            <small>Valores efetivamente recebidos</small>
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

          <small>
            Percentual recebido em relação ao valor total de vendas.
          </small>
        </div>

      </section>

      {/* GRÁFICOS PRINCIPAIS */}
      <section className="dashboard-graficos">

        <div className="dashboard-bloco grafico-financeiro">
          <div className="bloco-cabecalho">
            <div>
              <h2>Visão financeira</h2>
              <p>Comparativo entre vendas e recebimentos</p>
            </div>
            <span className="bloco-etiqueta">FINANCEIRO</span>
          </div>

          {dadosFinanceiros.some((item) => item.valor > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={dadosFinanceiros}
                margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(valor) =>
                    `R$ ${Number(valor).toLocaleString('pt-BR')}`
                  }
                  width={85}
                />
                <Tooltip
                  formatter={(valor) => [moeda(valor), 'Valor']}
                />
                <Bar
                  dataKey="valor"
                  name="Valor"
                  fill="#2F6FED"
                  radius={[7, 7, 0, 0]}
                  barSize={65}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="grafico-vazio">Ainda não existem valores financeiros para exibir.</p>
          )}
        </div>

        <div className="dashboard-bloco grafico-distribuicao">
          <div className="bloco-cabecalho">
            <div>
              <h2>Distribuição dos pedidos</h2>
              <p>Participação de cada situação</p>
            </div>
            <span className="bloco-etiqueta">PEDIDOS</span>
          </div>

          {dadosPizza.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
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
                    formatter={(valor, nome) => [
                      `${valor} pedido(s)`,
                      nome
                    ]}
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
        </div>

      </section>

      {/* PEDIDOS POR STATUS */}
      <section className="dashboard-bloco dashboard-status">
        <div className="bloco-cabecalho">
          <div>
            <h2>Pedidos por status</h2>
            <p>Quantidade de pedidos em cada etapa</p>
          </div>
          <span className="bloco-etiqueta">ACOMPANHAMENTO</span>
        </div>

        {dadosPedidos.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dadosPedidos}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="status"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(valor) => [`${valor} pedido(s)`, 'Quantidade']}
              />
              <Bar
                dataKey="quantidade"
                name="Pedidos"
                radius={[7, 7, 0, 0]}
                barSize={55}
              >
                {dadosPedidos.map((item) => (
                  <Cell key={item.status} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="grafico-vazio">Nenhum pedido encontrado.</p>
        )}
      </section>

      {/* ESTOQUE */}
      <section className="dashboard-bloco dashboard-estoque">
        <div className="bloco-cabecalho">
          <div>
            <h2>Atenção ao estoque</h2>
            <p>Materiais que atingiram ou estão abaixo do estoque mínimo</p>
          </div>

          <span className="estoque-contador">
            {estoqueBaixo.length} material(is)
          </span>
        </div>

        {dadosEstoque.length > 0 ? (
          <>
            <div className="estoque-grafico">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dadosEstoque}
                  margin={{ top: 15, right: 15, left: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="material"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="atual"
                    name="Quantidade atual"
                    fill="#2F6FED"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="minimo"
                    name="Estoque mínimo"
                    fill="#F59E0B"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="estoque-alertas">
              {dadosEstoque.map((item, index) => (
                <div className="estoque-alerta-item" key={`${item.material}-${index}`}>
                  <div>
                    <strong>{item.material}</strong>
                    <span>
                      Atual: {numero(item.atual)} | Mínimo: {numero(item.minimo)}
                    </span>
                  </div>
                  <span className="estoque-alerta-status">
                    Estoque baixo
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="estoque-sem-alertas">
            <span className="estoque-sem-alertas-icone">✓</span>
            <div>
              <strong>Estoque em situação normal</strong>
              <p>Nenhum material com estoque baixo foi informado pelo relatório.</p>
            </div>
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        MarcenariaPro · Painel de gestão
      </footer>

    </div>
  )
}

export default Dashboard
