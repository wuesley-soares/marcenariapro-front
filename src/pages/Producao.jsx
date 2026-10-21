import { useEffect, useState } from 'react'
import api from '../services/api'
import './Producao.css'

function Producao() {
  const [producoes, setProducoes] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [materiais, setMateriais] = useState([])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarMateriais, setMostrarMateriais] = useState(false)

  const [producaoEditando, setProducaoEditando] = useState(null)
  const [producaoSelecionada, setProducaoSelecionada] = useState(null)

  const [itensProducao, setItensProducao] = useState([])

  const [form, setForm] = useState({
    status: 'AGUARDANDO',
    pedidoId: ''
  })

  const [formMaterial, setFormMaterial] = useState({
    materialId: '',
    quantidade: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [producoesResponse, pedidosResponse, materiaisResponse] =
        await Promise.all([
          api.get('/producoes'),
          api.get('/pedidos'),
          api.get('/materiais')
        ])

      

      setProducoes(producoesResponse.data)
      setPedidos(pedidosResponse.data)
      setMateriais(materiaisResponse.data)
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar os dados.')
    }
  }

  function abrirNovo() {
    setProducaoEditando(null)

    setForm({
      status: 'AGUARDANDO',
      pedidoId: ''
    })

    setMostrarFormulario(true)
  }

  function editar(producao) {
    setProducaoEditando(producao)

    setForm({
      status: producao.status,
      pedidoId: producao.pedidoId
    })

    setMostrarFormulario(true)
  }

  async function salvar(e) {
    e.preventDefault()

    try {
      const dados = {
        status: form.status,
        pedidoId: Number(form.pedidoId)
      }

      if (producaoEditando) {
        await api.put(
          `/producoes/${producaoEditando.id}`,
          dados
        )
      } else {
        await api.post('/producoes', dados)
      }

      setMostrarFormulario(false)
      setProducaoEditando(null)

      await carregarDados()

      alert(
        producaoEditando
          ? 'Produção atualizada com sucesso!'
          : 'Produção criada com sucesso!'
      )
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.message ||
          'Não foi possível salvar a produção.'
      )
    }
  }

  async function excluir(id) {
    if (!window.confirm('Deseja excluir esta produção?')) {
      return
    }

    try {
      await api.delete(`/producoes/${id}`)

      await carregarDados()

      alert('Produção excluída com sucesso!')
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.message ||
          'Não foi possível excluir a produção.'
      )
    }
  }

  async function abrirMateriais(producao) {
    try {
      const response = await api.get(
        `/producoes/${producao.id}/materiais`
      )

      setProducaoSelecionada(producao)
      setItensProducao(response.data)

      setFormMaterial({
        materialId: '',
        quantidade: ''
      })

      setMostrarMateriais(true)
    } catch (error) {
      console.error(error)

      alert(
        'Erro ao carregar os materiais da produção.'
      )
    }
  }

  async function adicionarMaterial(e) {
    e.preventDefault()

    if (
      !formMaterial.materialId ||
      !formMaterial.quantidade
    ) {
      alert('Informe o material e a quantidade.')
      return
    }

    if (Number(formMaterial.quantidade) <= 0) {
      alert('A quantidade deve ser maior que zero.')
      return
    }

    try {
      const dados = {
        quantidade: Number(formMaterial.quantidade),
        materialId: Number(formMaterial.materialId)
      }

      await api.post(
        `/producoes/${producaoSelecionada.id}/materiais`,
        dados
      )

      const response = await api.get(
        `/producoes/${producaoSelecionada.id}/materiais`
      )

      setItensProducao(response.data)

      setFormMaterial({
        materialId: '',
        quantidade: ''
      })

      alert('Material adicionado à produção!')
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.message ||
          'Não foi possível adicionar o material.'
      )
    }
  }


  async function removerMaterial(itemId) {
  if (!producaoSelecionada) {
    return
  }

  if (
    !window.confirm(
      'Deseja realmente remover este material da produção?'
    )
  ) {
    return
  }

  try {
    await api.delete(
      `/producoes/${producaoSelecionada.id}/materiais/${itemId}`
    )

    const response = await api.get(
      `/producoes/${producaoSelecionada.id}/materiais`
    )

    setItensProducao(response.data)

    alert('Material removido com sucesso!')
  } catch (error) {
    console.error(error)

    alert(
      error.response?.data?.message ||
        'Não foi possível remover o material.'
    )
  }
}

  function fecharMateriais() {
    setMostrarMateriais(false)
    setProducaoSelecionada(null)
    setItensProducao([])
  }

  function traduzirStatus(status) {
    const nomes = {
      AGUARDANDO: 'Aguardando',
      EM_PRODUCAO: 'Em produção',
      PRONTO: 'Pronto',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado'
    }

    return nomes[status] || status
  }

  function formatarData(data) {
    if (!data) {
      return '-'
    }

    return new Date(data).toLocaleString('pt-BR')
  }

  return (
    <div className="producao">

      <div className="producao-header">
        <div>
          <h1>Produção</h1>

          <p>
            Gerencie as produções e os materiais utilizados.
          </p>
        </div>

        <button
          className="botao-novo"
          onClick={abrirNovo}
        >
          + Nova produção
        </button>
      </div>

      {mostrarFormulario && (
        <div className="producao-formulario">

          <h2>
            {producaoEditando
              ? 'Editar produção'
              : 'Nova produção'}
          </h2>

          <form onSubmit={salvar}>

            <div>
              <label>Pedido</label>

              <select
                value={form.pedidoId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pedidoId: e.target.value
                  })
                }
                disabled={!!producaoEditando}
                required
              >
                <option value="">
                  Selecione um pedido
                </option>

                  {pedidos
                    .filter(
                      (pedido) =>
                        pedido.status !== 'ENTREGUE' &&
                        pedido.status !== 'CANCELADO'
                    )
                    .map((pedido) => (
                      <option
                        key={pedido.id}
                        value={pedido.id}
                      >
                        {`Pedido #${pedido.id} - ${
                          pedido.cliente?.nome ||
                          pedido.orcamento?.projeto?.nome ||
                          pedido.projeto?.nome ||
                          'Nome não informado'
                        }`}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label>Status</label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value
                  })
                }
                required
              >
                <option value="AGUARDANDO">
                  Aguardando
                </option>

                <option value="EM_PRODUCAO">
                  Em produção
                </option>

                <option value="PRONTO">
                  Pronto
                </option>

                <option value="ENTREGUE">
                  Entregue
                </option>

                <option value="CANCELADO">
                  Cancelado
                </option>
              </select>
            </div>

            <div className="formulario-botoes">

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false)
                  setProducaoEditando(null)
                }}
              >
                Cancelar
              </button>

              <button type="submit">
                Salvar
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="producao-tabela">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Pedido</th>
              <th>Status</th>
              <th>Data de criação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {producoes.length === 0 ? (
              <tr>
                <td colSpan="5">
                  Nenhuma produção cadastrada.
                </td>
              </tr>
            ) : (
              producoes.map((producao) => (
                <tr key={producao.id}>

                  <td>
                    #{producao.id}
                  </td>

                  <td>
                    Pedido #{producao.pedidoId}
                  </td>

                  <td>
                    {traduzirStatus(producao.status)}
                  </td>

                  <td>
                    {formatarData(
                      producao.dataCriacao
                    )}
                  </td>

                  <td>
                    <div className="acoes">

                      <button
                        className="botao-materiais"
                        onClick={() =>
                          abrirMateriais(producao)
                        }
                      >
                        Materiais
                      </button>

                      <button
                        className="botao-editar"
                        onClick={() =>
                          editar(producao)
                        }
                      >
                        Editar
                      </button>

                      <button
                        className="botao-excluir"
                        onClick={() =>
                          excluir(producao.id)
                        }
                      >
                        Excluir
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {mostrarMateriais && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  Materiais da Produção #
                  {producaoSelecionada?.id}
                </h2>

                <p>
                  Pedido #
                  {producaoSelecionada?.pedidoId}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={fecharMateriais}
              >
                ×
              </button>

            </div>

            <form
              className="material-form"
              onSubmit={adicionarMaterial}
            >

              <div>
                <label>Material</label>

                <select
                  value={formMaterial.materialId}
                  onChange={(e) =>
                    setFormMaterial({
                      ...formMaterial,
                      materialId: e.target.value
                    })
                  }
                  required
                >
                  <option value="">
                    Selecione um material
                  </option>

                  {materiais.map((material) => (
                    <option
                      key={material.id}
                      value={material.id}
                    >
                      {material.nome} — Estoque:{' '}
                      {material.quantidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Quantidade</label>

                <input
                  type="number"
                  min="1"
                  value={formMaterial.quantidade}
                  onChange={(e) =>
                    setFormMaterial({
                      ...formMaterial,
                      quantidade: e.target.value
                    })
                  }
                  required
                />
              </div>

                {(producaoSelecionada?.status === 'AGUARDANDO' ||
                producaoSelecionada?.status === 'EM_PRODUCAO') && (
                <button
                  type="submit"
                  className="botao-novo"
                >
                  + Adicionar
                </button>
                )}

            </form>

            <div className="materiais-lista">

              <h3>Materiais utilizados</h3>

              {itensProducao.length === 0 ? (
                <p>
                  Nenhum material adicionado a esta
                  produção.
                </p>
              ) : (
                <table>

                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Quantidade</th>
                          <th>Ações</th>
                        </tr>
                      </thead>

                  <tbody>

                  {itensProducao.map((item) => (
                        <tr key={item.id}>

                          <td>
                            {item.materialNome}
                          </td>

                          <td>
                            {item.quantidade}
                          </td>

                          <td>
                            {producaoSelecionada?.status === 'AGUARDANDO' && (
                              <button
                                type="button"
                                className="botao-excluir"
                                onClick={() => removerMaterial(item.id)}
                              >
                                Remover
                              </button>
                            )}
                          </td>

                        </tr>
                      ))}

                  </tbody>

                </table>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default Producao