
import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import api from '../services/api'
import './Dashboard.css'

const CORES_STATUS = [
  '#2F6FED',
  '#F59E0B',
  '#16A34A',
  '#DC2626',
  '#8B5CF6',
  '#64748B'
]

function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [pedidosStatus, setPedidosStatus] = useState([])
  const [estoqueBaixo, setEstoqueBaixo] = useState([])

  useEffect(() => {
    async function carregarResumo() {
      try {
        const resposta = await api.get('/relatorios/resumo')
        setResumo(resposta.data)
      } catch (error) {
        console.error('Erro ao carregar resumo:', error)
      }
    }

    async function carregarPedidosStatus() {
      try {
        const resposta = await api.get('/relatorios/pedidos-status')
        setPedidosStatus(resposta.data)
      } catch (error) {
        console.error('Erro ao carregar pedidos por status:', error)
      }
    }

    async function carregarEstoqueBaixo() {
      try {
        const resposta = await api.get('/relatorios/estoque')
        setEstoqueBaixo(resposta.data)
      } catch (error) {
        console.error('Erro ao carregar estoque:', error)
      }
    }

    carregarResumo()
    carregarPedidosStatus()
    carregarEstoqueBaixo()
  }, [])

  if (!resumo) {
    return <p>Carregando...</p>
  }

  const dadosPizza = pedidosStatus
    .filter((item) => Number(item.quantidade) > 0)
    .map((item) => ({
      name: item.status,
      value: Number(item.quantidade)
    }))

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral do MarcenariaPro</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span>Clientes</span>
          <strong>{resumo.totalClientes}</strong>
        </div>

        <div className="dashboard-card">
          <span>Projetos</span>
          <strong>{resumo.totalProjetos}</strong>
        </div>

        <div className="dashboard-card">
          <span>Orçamentos</span>
          <strong>{resumo.totalOrcamentos}</strong>
        </div>

        <div className="dashboard-card">
          <span>Pedidos</span>
          <strong>{resumo.totalPedidos}</strong>
        </div>

        <div className="dashboard-card">
          <span>Pedidos em produção</span>
          <strong>{resumo.pedidosEmProducao}</strong>
        </div>

        <div className="dashboard-card">
          <span>Pedidos concluídos</span>
          <strong>{resumo.pedidosConcluidos}</strong>
        </div>

        <div className="dashboard-card">
          <span>Valor total de vendas</span>
          <strong>
            {(resumo.valorTotalVendas ?? 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </div>

        <div className="dashboard-card">
          <span>Valor recebido</span>
          <strong>
            {(resumo.valorTotalRecebido ?? 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </div>
      </div>

      <div className="dashboard-graficos">
        <section className="dashboard-section">
          <h2>Pedidos por status</h2>

          {pedidosStatus.length === 0 ? (
            <p>Nenhum pedido encontrado.</p>
          ) : (
            <div className="status-chart">
              {pedidosStatus.map((item) => {
                const maiorQuantidade = Math.max(
                  ...pedidosStatus.map((pedido) =>
                    Number(pedido.quantidade) || 0
                  ),
                  1
                )

                const largura =
                  ((Number(item.quantidade) || 0) / maiorQuantidade) * 100

                return (
                  <div className="status-chart-item" key={item.status}>
                    <div className="status-chart-info">
                      <span>{item.status}</span>
                      <strong>{item.quantidade}</strong>
                    </div>

                    <div className="status-bar">
                      <div
                        className="status-bar-fill"
                        style={{ width: `${largura}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Distribuição dos pedidos</h2>

          {dadosPizza.length === 0 ? (
            <p>Não há pedidos para exibir no gráfico.</p>
          ) : (
            <div className="pizza-chart">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                          data={dadosPizza}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={75}
                          paddingAngle={2}
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                    {dadosPizza.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={CORES_STATUS[index % CORES_STATUS.length]}
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
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-section">
        <h2>Estoque baixo</h2>

        {estoqueBaixo.length === 0 ? (
          <p className="estoque-ok">
            Nenhum material com estoque baixo.
          </p>
        ) : (
          <div className="estoque-list">
            {estoqueBaixo.map((item) => (
              <div className="estoque-item" key={item.materialId}>
                <div>
                  <strong>{item.material}</strong>
                  <span>
                    Atual: {item.quantidadeAtual} | Mínimo: {item.estoqueMinimo}
                  </span>
                </div>

                <span className="estoque-alerta">
                  {item.situacao}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
