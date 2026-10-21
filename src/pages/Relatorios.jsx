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

  async function carregarRelatorios() {
    setCarregando(true)
    setErro('')

    const requisicoes = [
      { nome: 'resumo', requisicao: () => api.get('/relatorios/resumo') },
      { nome: 'estoque', requisicao: () => api.get('/relatorios/estoque') },
      { nome: 'financeiro', requisicao: () => api.get('/relatorios/financeiro') },
      { nome: 'produção', requisicao: () => api.get('/relatorios/producao') },
      { nome: 'pedidos', requisicao: () => api.get('/relatorios/pedidos-status') },
      {
        nome: 'assistências',
        requisicao: () => api.get('/relatorios/assistencias-status')
      }
    ]

    const setters = [
      setResumo,
      setEstoque,
      setFinanceiro,
      setProducao,
      setPedidos,
      setAssistencias
    ]

    const falhas = []

    try {
      const resultados = await Promise.allSettled(
        requisicoes.map((item) => item.requisicao())
      )

      resultados.forEach((resultado, indice) => {
        if (resultado.status === 'fulfilled') {
          setters[indice](resultado.value.data)
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
    carregarRelatorios()
  }, [])

  function valorMonetario(valor) {
    return Number(valor ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function renderLista(dados, campoNome, campoValor) {
    if (!dados?.length) {
      return <p className="relatorios-vazio">Nenhum dado disponível.</p>
    }

    return (
      <div className="relatorios-lista">
        {dados.map((item, indice) => (
          <div className="relatorios-linha" key={item.id ?? indice}>
            <span>{item[campoNome] ?? 'Não informado'}</span>
            <strong>{item[campoValor] ?? 0}</strong>
          </div>
        ))}
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="relatorios-page">
        <p>Carregando relatórios...</p>
      </div>
    )
  }

  return (
    <div className="relatorios-page">
      <header className="relatorios-header">
        <div>
          <h1>Relatórios</h1>
          <p>Acompanhe os indicadores da sua marcenaria.</p>
        </div>

        <button
          className="relatorios-atualizar"
          onClick={carregarRelatorios}
        >
          Atualizar
        </button>
      </header>

      {erro && <div className="relatorios-alerta">{erro}</div>}

      <section className="relatorios-cards">
        <article className="relatorios-card">
          <span>Total de clientes</span>
          <strong>{resumo?.totalClientes ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Total de projetos</span>
          <strong>{resumo?.totalProjetos ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Total de orçamentos</span>
          <strong>{resumo?.totalOrcamentos ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Total de pedidos</span>
          <strong>{resumo?.totalPedidos ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Pedidos em produção</span>
          <strong>{resumo?.pedidosEmProducao ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Pedidos concluídos</span>
          <strong>{resumo?.pedidosConcluidos ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Total de assistências</span>
          <strong>{resumo?.totalAssistencias ?? 0}</strong>
        </article>

        <article className="relatorios-card">
          <span>Valor total de vendas</span>
          <strong>{valorMonetario(resumo?.valorTotalVendas)}</strong>
        </article>

        <article className="relatorios-card">
          <span>Valor total recebido</span>
          <strong>{valorMonetario(resumo?.valorTotalRecebido)}</strong>
        </article>
      </section>

      <section className="relatorios-grid">
        <article className="relatorios-painel">
          <h2>Pedidos por status</h2>
          {renderLista(pedidos, 'status', 'quantidade')}
        </article>

        <article className="relatorios-painel">
          <h2>Produção por status</h2>
          {renderLista(producao, 'status', 'quantidade')}
        </article>

        <article className="relatorios-painel">
          <h2>Assistências por status</h2>
          {renderLista(assistencias, 'status', 'quantidade')}
        </article>

        <article className="relatorios-painel">
          <h2>Estoque</h2>

          {!estoque.length ? (
            <p className="relatorios-vazio">Nenhum dado disponível.</p>
          ) : (
            <div className="relatorios-lista">
              {estoque.map((item) => (
                <div
                  className="relatorios-item-estoque"
                  key={item.materialId}
                >
                  <div className="relatorios-estoque-cabecalho">
                    <strong>{item.material}</strong>
                    <span>{item.situacao}</span>
                  </div>

                  <p>
                    Quantidade atual: {item.quantidadeAtual ?? 0}
                  </p>

                  <p>
                    Estoque mínimo: {item.estoqueMinimo ?? 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="relatorios-painel relatorios-painel-largo">
          <h2>Relatório financeiro por pedido</h2>

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
                      <td>#{item.pedidoId}</td>
                      <td>{valorMonetario(item.valorPedido)}</td>
                      <td>{valorMonetario(item.valorPago)}</td>
                      <td>{valorMonetario(item.valorRestante)}</td>
                      <td>{item.situacao ?? 'Não informada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  )
}

export default Relatorios