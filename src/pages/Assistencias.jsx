import { useEffect, useState } from 'react'
import api from '../services/api'
import './Assistencias.css'

function Assistencias() {
  const [assistencias, setAssistencias] = useState([])
  const [clientes, setClientes] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [materiais, setMateriais] = useState([])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarMateriais, setMostrarMateriais] = useState(false)

  const [assistenciaEditando, setAssistenciaEditando] =
    useState(null)

  const [assistenciaSelecionada, setAssistenciaSelecionada] =
    useState(null)

  const [itensMateriais, setItensMateriais] = useState([])

  const [formulario, setFormulario] = useState({
    dataSolicitacao: '',
    dataAgendamento: '',
    descricao: '',
    dataEntregaOriginal: '',
    valorServico: '',
    valorMateriais: '',
    status: 'ABERTA',
    clienteId: '',
    pedidoId: '',
    funcionarioId: ''
  })

  const [materialFormulario, setMaterialFormulario] = useState({
    materialId: '',
    quantidade: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [
        respostaAssistencias,
        respostaClientes,
        respostaPedidos,
        respostaUsuarios,
        respostaMateriais
      ] = await Promise.all([
        api.get('/assistencias-tecnicas'),
        api.get('/clientes'),
        api.get('/pedidos'),
        api.get('/usuarios'),
        api.get('/materiais')
      ])

      setAssistencias(respostaAssistencias.data)
      setClientes(respostaClientes.data)
      setPedidos(respostaPedidos.data)
      setUsuarios(respostaUsuarios.data)
      setMateriais(respostaMateriais.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao carregar dados.'

      alert(mensagem)
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function alterarMaterialCampo(event) {
    const { name, value } = event.target

    setMaterialFormulario({
      ...materialFormulario,
      [name]: value
    })
  }

  function novaAssistencia() {
    setAssistenciaEditando(null)

    setFormulario({
      dataSolicitacao: new Date()
        .toISOString()
        .split('T')[0],
      dataAgendamento: '',
      descricao: '',
      dataEntregaOriginal: '',
      valorServico: '',
      valorMateriais: '',
      status: 'ABERTA',
      clienteId: '',
      pedidoId: '',
      funcionarioId: ''
    })

    setMostrarFormulario(true)
  }

  function editarAssistencia(assistencia) {
    setAssistenciaEditando(assistencia)

    setFormulario({
      dataSolicitacao:
        assistencia.dataSolicitacao || '',

      dataAgendamento:
        assistencia.dataAgendamento
          ? assistencia.dataAgendamento.slice(0, 16)
          : '',

      descricao:
        assistencia.descricao || '',

      dataEntregaOriginal:
        assistencia.dataEntregaOriginal || '',

      valorServico:
        assistencia.valorServico ?? '',

      valorMateriais:
        assistencia.valorMateriais ?? '',

      status:
        assistencia.status || 'ABERTA',

      clienteId:
        assistencia.clienteId || '',

      pedidoId:
        assistencia.pedidoId || '',

      funcionarioId:
        assistencia.funcionarioId || ''
    })

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setAssistenciaEditando(null)

    setFormulario({
      dataSolicitacao: '',
      dataAgendamento: '',
      descricao: '',
      dataEntregaOriginal: '',
      valorServico: '',
      valorMateriais: '',
      status: 'ABERTA',
      clienteId: '',
      pedidoId: '',
      funcionarioId: ''
    })
  }

  async function salvarAssistencia(event) {
    event.preventDefault()

    try {
      const dados = {
        dataSolicitacao:
          formulario.dataSolicitacao,

        dataAgendamento:
          formulario.dataAgendamento
            ? formulario.dataAgendamento + ':00'
            : null,

        descricao:
          formulario.descricao,

        dataEntregaOriginal:
          formulario.dataEntregaOriginal,

        valorServico:
          Number(formulario.valorServico || 0),

        valorMateriais:
          Number(formulario.valorMateriais || 0),

        status:
          formulario.status,

        clienteId:
          Number(formulario.clienteId),

       pedidoId: formulario.pedidoId
        ? Number(formulario.pedidoId)
        : null,

        funcionarioId:
          Number(formulario.funcionarioId)
      }

      if (assistenciaEditando) {
        await api.put(
          `/assistencias-tecnicas/${assistenciaEditando.id}`,
          dados
        )

        alert(
          'Assistência técnica atualizada com sucesso!'
        )
      } else {
        await api.post(
          '/assistencias-tecnicas',
          dados
        )

        alert(
          'Assistência técnica cadastrada com sucesso!'
        )
      }

      cancelarFormulario()

      await carregarDados()

    } catch (error) {
      console.error(
        'Erro ao salvar assistência:',
        error
      )

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar assistência técnica.'

      alert(mensagem)
    }
  }

  async function excluirAssistencia(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir esta assistência técnica?'
    )

    if (!confirmar) {
      return
    }

    try {
      await api.delete(
        `/assistencias-tecnicas/${id}`
      )

      alert(
        'Assistência técnica excluída com sucesso!'
      )

      await carregarDados()

    } catch (error) {
      console.error(
        'Erro ao excluir assistência:',
        error
      )

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir assistência técnica.'

      alert(mensagem)
    }
  }

  async function abrirMateriais(assistencia) {
    try {
      const resposta =
        await api.get(
          `/assistencias-tecnicas/${assistencia.id}/materiais`
        )

      setAssistenciaSelecionada(assistencia)
      setItensMateriais(resposta.data)

      setMaterialFormulario({
        materialId: '',
        quantidade: ''
      })

      setMostrarMateriais(true)

    } catch (error) {
      console.error(
        'Erro ao carregar materiais:',
        error
      )

      const mensagem =
        error.response?.data?.message ||
        'Erro ao carregar materiais.'

      alert(mensagem)
    }
  }

  function fecharMateriais() {
    setMostrarMateriais(false)
    setAssistenciaSelecionada(null)
    setItensMateriais([])

    setMaterialFormulario({
      materialId: '',
      quantidade: ''
    })
  }

  async function adicionarMaterial(event) {
    event.preventDefault()

    if (!assistenciaSelecionada) {
      return
    }

    try {
      const dados = {
        materialId:
          Number(materialFormulario.materialId),

        quantidade:
          Number(materialFormulario.quantidade)
      }

      await api.post(
        `/assistencias-tecnicas/${assistenciaSelecionada.id}/materiais`,
        dados
      )

      alert(
        'Material adicionado com sucesso!'
      )

      const respostaMateriais =
        await api.get(
          `/assistencias-tecnicas/${assistenciaSelecionada.id}/materiais`
        )

      setItensMateriais(
        respostaMateriais.data
      )

      setMaterialFormulario({
        materialId: '',
        quantidade: ''
      })

      await carregarDados()

      const respostaAssistencia =
        await api.get(
          `/assistencias-tecnicas/${assistenciaSelecionada.id}`
        )

      setAssistenciaSelecionada(
        respostaAssistencia.data
      )

    } catch (error) {
      console.error(
        'Erro ao adicionar material:',
        error
      )

      const mensagem =
        error.response?.data?.message ||
        'Erro ao adicionar material.'

      alert(mensagem)
    }
  }

  async function excluirMaterial(item) {
  const confirmar = window.confirm(
    'Deseja remover este material da assistência? A quantidade será devolvida ao estoque.'
  )

  if (!confirmar) {
    return
  }

  try {
    await api.delete(
      `/assistencias-tecnicas/${assistenciaSelecionada.id}/materiais/${item.id}`
    )

    alert(
      'Material removido e devolvido ao estoque!'
    )

    const respostaMateriais =
      await api.get(
        `/assistencias-tecnicas/${assistenciaSelecionada.id}/materiais`
      )

    setItensMateriais(respostaMateriais.data)

    await carregarDados()

    const respostaAssistencia =
      await api.get(
        `/assistencias-tecnicas/${assistenciaSelecionada.id}`
      )

    setAssistenciaSelecionada(
      respostaAssistencia.data
    )

  } catch (error) {
    console.error(
      'Erro ao excluir material:',
      error
    )

    const mensagem =
      error.response?.data?.message ||
      'Erro ao excluir material.'

    alert(mensagem)
  }
}

  function encontrarCliente(id) {
    return clientes.find(
      cliente =>
        Number(cliente.id) === Number(id)
    )
  }

  function encontrarPedido(id) {
    return pedidos.find(
      pedido =>
        Number(pedido.id) === Number(id)
    )
  }

  function encontrarFuncionario(id) {
    return usuarios.find(
      usuario =>
        Number(usuario.id) === Number(id)
    )
  }

  function encontrarMaterial(id) {
    return materiais.find(
      material =>
        Number(material.id) === Number(id)
    )
  }

  function textoStatus(status) {
    switch (status) {
      case 'ABERTA':
        return 'Aberta'

      case 'EM_ANALISE':
        return 'Em análise'

      case 'RESOLVIDA':
        return 'Resolvida'

      case 'CANCELADA':
        return 'Cancelada'

      default:
        return status
    }
  }

  function classeStatus(status) {
    switch (status) {
      case 'ABERTA':
        return 'status-aberta'

      case 'EM_ANALISE':
        return 'status-analise'

      case 'RESOLVIDA':
        return 'status-resolvida'

      case 'CANCELADA':
        return 'status-cancelada'

      default:
        return ''
    }
  }

  return (
    <div className="assistencias">

      <div className="assistencias-header">

        <div>
          <h1>Assistência Técnica</h1>

          <p>
            Controle das solicitações de assistência técnica
          </p>
        </div>

        <button
          className="botao-novo"
          onClick={novaAssistencia}
        >
          Nova assistência
        </button>

      </div>

      {mostrarFormulario && (
        <div className="assistencia-formulario">

          <h2>
            {assistenciaEditando
              ? 'Editar assistência'
              : 'Nova assistência'}
          </h2>

          <form onSubmit={salvarAssistencia}>

            <div className="formulario-grid">

              <div>
                <label>Cliente</label>

                <select
                  name="clienteId"
                  value={formulario.clienteId}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione um cliente
                  </option>

                  {clientes.map(cliente => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Pedido</label>

                <select
                  name="pedidoId"
                  value={formulario.pedidoId}
                  onChange={alterarCampo}
                  
                >
                  <option value="">
                    Nenhum pedido vinculado
                  </option>

                  {pedidos.map(pedido => (
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
                <label>Funcionário</label>

                <select
                  name="funcionarioId"
                  value={formulario.funcionarioId}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione um funcionário
                  </option>

                  {usuarios.map(usuario => (
                    <option
                      key={usuario.id}
                      value={usuario.id}
                    >
                      {usuario.nome || usuario.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Data da solicitação</label>

                <input
                  type="date"
                  name="dataSolicitacao"
                  value={formulario.dataSolicitacao}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div>
                <label>Data de entrega original</label>

                <input
                  type="date"
                  name="dataEntregaOriginal"
                  value={formulario.dataEntregaOriginal}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div>
                <label>Data do agendamento</label>

                <input
                  type="datetime-local"
                  name="dataAgendamento"
                  value={formulario.dataAgendamento}
                  onChange={alterarCampo}
                />
              </div>

              <div>
                <label>Status</label>

                <select
                  name="status"
                  value={formulario.status}
                  onChange={alterarCampo}
                  required
                >
                  <option value="ABERTA">
                    Aberta
                  </option>

                  <option value="EM_ANALISE">
                    Em análise
                  </option>

                  <option value="RESOLVIDA">
                    Resolvida
                  </option>

                  <option value="CANCELADA">
                    Cancelada
                  </option>
                </select>
              </div>

              <div>
                <label>Valor do serviço</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="valorServico"
                  value={formulario.valorServico}
                  onChange={alterarCampo}
                  placeholder="0,00"
                />
              </div>

            </div>

            <div className="campo-descricao">

              <label>Descrição do problema</label>

              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                required
                placeholder="Descreva o problema apresentado..."
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
                {assistenciaEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="assistencias-tabela">

        <table>

          <thead>
            <tr>
              <th>Cliente</th>
              <th>Pedido</th>
              <th>Solicitação</th>
              <th>Garantia</th>
              <th>Valor materiais</th>
              <th>Valor total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {assistencias.map(assistencia => {

              const cliente =
                encontrarCliente(
                  assistencia.clienteId
                )

              return (
                <tr key={assistencia.id}>

                  <td>
                    {cliente?.nome || '-'}
                  </td>

                  <td>
                    #{assistencia.pedidoId}
                  </td>

                  <td>
                    {assistencia.dataSolicitacao
                      ? new Date(
                          `${assistencia.dataSolicitacao}T00:00:00`
                        ).toLocaleDateString(
                          'pt-BR'
                        )
                      : '-'}
                  </td>

                  <td>

                    <span
                      className={
                        assistencia.dentroGarantia
                          ? 'garantia-sim'
                          : 'garantia-nao'
                      }
                    >
                      {assistencia.dentroGarantia
                        ? 'Dentro da garantia'
                        : 'Fora da garantia'}
                    </span>

                  </td>

                  <td>
                    R${' '}
                    {Number(
                      assistencia.valorMateriais || 0
                    ).toFixed(2)}
                  </td>

                  <td>
                    R${' '}
                    {Number(
                      assistencia.valorTotal || 0
                    ).toFixed(2)}
                  </td>

                  <td>

                    <span
                      className={`status ${classeStatus(
                        assistencia.status
                      )}`}
                    >
                      {textoStatus(
                        assistencia.status
                      )}
                    </span>

                  </td>

                  <td>

                    <div className="acoes">

                      <button
                        className="botao-materiais"
                        onClick={() =>
                          abrirMateriais(
                            assistencia
                          )
                        }
                      >
                        Materiais
                      </button>

                      <button
                        className="botao-editar"
                        onClick={() =>
                          editarAssistencia(
                            assistencia
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        className="botao-excluir"
                        onClick={() =>
                          excluirAssistencia(
                            assistencia.id
                          )
                        }
                      >
                        Excluir
                      </button>

                    </div>

                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

      {mostrarMateriais &&
        assistenciaSelecionada && (

        <div className="modal-fundo">

          <div className="modal-materiais">

            <div className="modal-header">

              <div>
                <h2>
                  Materiais da assistência #
                  {assistenciaSelecionada.id}
                </h2>

                <p>
                  {assistenciaSelecionada.descricao}
                </p>
              </div>

              <button
                className="botao-fechar"
                onClick={fecharMateriais}
              >
                ×
              </button>

            </div>

            <div className="resumo-materiais">

              <div>
                <span>
                  Valor dos materiais
                </span>

                <strong>
                  R${' '}
                  {Number(
                    assistenciaSelecionada.valorMateriais ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>
                  Valor do serviço
                </span>

                <strong>
                  R${' '}
                  {Number(
                    assistenciaSelecionada.valorServico ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>
                  Valor total
                </span>

                <strong>
                  R${' '}
                  {Number(
                    assistenciaSelecionada.valorTotal ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

            </div>

            <div className="adicionar-material">

              <h3>
                Adicionar material
              </h3>

              <form
                onSubmit={adicionarMaterial}
              >

                <div>

                  <label>Material</label>

                  <select
                    name="materialId"
                    value={
                      materialFormulario.materialId
                    }
                    onChange={
                      alterarMaterialCampo
                    }
                    required
                  >
                    <option value="">
                      Selecione um material
                    </option>

                    {materiais.map(material => (

                      <option
                        key={material.id}
                        value={material.id}
                      >
                        {material.nome}
                        {' - '}
                        Estoque:{' '}
                        {material.quantidade}
                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label>
                    Quantidade
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="quantidade"
                    value={
                      materialFormulario.quantidade
                    }
                    onChange={
                      alterarMaterialCampo
                    }
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="botao-adicionar-material"
                >
                  Adicionar
                </button>

              </form>

            </div>

            <div className="lista-materiais">

              <h3>
                Materiais utilizados
              </h3>

              {itensMateriais.length === 0 ? (

                <p className="sem-materiais">
                  Nenhum material utilizado.
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

                    {itensMateriais.map(item => {

                      const material =
                        encontrarMaterial(
                          item.materialId
                        )

                      return (

                        <tr key={item.id}>

                            <td>
                                {item.materialNome ||
                                material?.nome ||
                                '-'}
                            </td>

                            <td>
                                {item.quantidade}
                            </td>

                            <td>
                                <button
                                className="botao-excluir-material"
                                onClick={() =>
                                    excluirMaterial(item)
                                }
                                >
                                Excluir
                                </button>
                            </td>

                            </tr>

                      )
                    })}

                  </tbody>

                </table>

              )}

            </div>

            <div className="modal-footer">

              <button
                onClick={fecharMateriais}
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

export default Assistencias