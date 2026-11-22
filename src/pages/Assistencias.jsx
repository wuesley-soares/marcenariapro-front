import { useEffect, useState } from 'react'
import api from '../services/api'
import './Assistencias.css'

function Assistencias() {
  const [assistencias, setAssistencias] = useState([])
  const [clientes, setClientes] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [materiais, setMateriais] = useState([])
  const [imagens, setImagens] = useState([])
const [arquivoImagem, setArquivoImagem] = useState(null)
const [etapaImagem, setEtapaImagem] = useState('PROBLEMA')
const [carregandoImagens, setCarregandoImagens] = useState(false)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarMateriais, setMostrarMateriais] = useState(false)

  const [assistenciaEditando, setAssistenciaEditando] =
    useState(null)

  const [assistenciaSelecionada, setAssistenciaSelecionada] =
    useState(null)

  const [itensMateriais, setItensMateriais] = useState([])

  const [menuAberto, setMenuAberto] = useState(null)

const [posicaoMenu, setPosicaoMenu] = useState({
  top: 0,
  left: 0
})

  const [formulario, setFormulario] = useState({
    dataSolicitacao: '',
    dataAgendamento: '',
    descricao: '',
    dataEntregaOriginal: '',
    valorServico: '',
    valorMateriais: '',
    status: 'ABERTA',
    clienteId: '',
    pedidoId: ''
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
        respostaMateriais
      ] = await Promise.all([
        api.get('/assistencias-tecnicas'),
        api.get('/clientes'),
        api.get('/pedidos'),
        api.get('/materiais')
      ])

      setAssistencias(respostaAssistencias.data)
      setClientes(respostaClientes.data)
      setPedidos(respostaPedidos.data)
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
      pedidoId: ''
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
        assistencia.pedidoId || ''
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
      pedidoId: ''
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

        valorServico: formulario.valorServico || "0.00",

        status:
          formulario.status,

        clienteId:
          Number(formulario.clienteId),

        pedidoId: formulario.pedidoId
          ? Number(formulario.pedidoId)
          : null
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

  async function carregarImagens(assistenciaId) {
  setCarregandoImagens(true)

  try {
    const resposta = await api.get(
      `/assistencias-tecnicas/${assistenciaId}/imagens`
    )

    const imagensComArquivo = await Promise.all(
      resposta.data.map(async imagem => {
        const arquivo = await api.get(
          `/assistencias-tecnicas/${assistenciaId}/imagens/${imagem.id}/arquivo`,
          { responseType: 'blob' }
        )

        return {
          ...imagem,
          url: URL.createObjectURL(arquivo.data)
        }
      })
    )

    setImagens(imagensComArquivo)
  } catch (error) {
    console.error('Erro ao carregar imagens:', error)
    alert('Não foi possível carregar as imagens.')
  } finally {
    setCarregandoImagens(false)
  }
}

async function enviarImagem(event) {
  event.preventDefault()

  if (!arquivoImagem || !assistenciaSelecionada) {
    alert('Selecione uma imagem.')
    return
  }

  const formularioImagem = new FormData()
  formularioImagem.append('arquivo', arquivoImagem)
  formularioImagem.append('etapa', etapaImagem)

  try {
    await api.post(
      `/assistencias-tecnicas/${assistenciaSelecionada.id}/imagens`,
      formularioImagem
    )

    setArquivoImagem(null)

    const campoArquivo = document.getElementById('arquivo-imagem-assistencia')

    if (campoArquivo) {
      campoArquivo.value = ''
    }

    await carregarImagens(assistenciaSelecionada.id)

    alert('Imagem enviada com sucesso!')
  } catch (error) {
    console.error('Erro ao enviar imagem:', error)

    alert(
      error.response?.data?.message ||
      'Não foi possível enviar a imagem.'
    )
  }
}

async function excluirImagem(imagem) {
  const confirmar = window.confirm(
    'Deseja realmente excluir esta imagem?'
  )

  if (!confirmar) return

  try {
    await api.delete(
      `/assistencias-tecnicas/${assistenciaSelecionada.id}/imagens/${imagem.id}`
    )

    URL.revokeObjectURL(imagem.url)

    setImagens(imagensAtuais =>
      imagensAtuais.filter(item => item.id !== imagem.id)
    )

    alert('Imagem excluída com sucesso!')
  } catch (error) {
    console.error('Erro ao excluir imagem:', error)

    alert(
      error.response?.data?.message ||
      'Não foi possível excluir a imagem.'
    )
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

      await carregarImagens(assistencia.id)

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

    imagens.forEach(imagem => {
  URL.revokeObjectURL(imagem.url)
})

setImagens([])
setArquivoImagem(null)
setEtapaImagem('PROBLEMA')
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
    'Deseja remover este material da assistência?'
  )

  if (!confirmar) {
    return
  }

  try {
    await api.delete(
      `/assistencias-tecnicas/${assistenciaSelecionada.id}/materiais/${item.id}`
    )

    alert(
      'Material removido da assistência com sucesso!'
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

  function encontrarMaterial(id) {
    return materiais.find(
      material =>
        Number(material.id) === Number(id)
    )
  }

 function textoStatus(status) {
  const nomes = {
    ABERTA: 'Aberta',
    AGENDADA: 'Agendada',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada'
  }

  return nomes[status] || status
}

function classeStatus(status) {
  const classes = {
    ABERTA: 'status-aberta',
    AGENDADA: 'status-agendada',
    EM_ANDAMENTO: 'status-andamento',
    CONCLUIDA: 'status-concluida',
    CANCELADA: 'status-cancelada'
  }

  return classes[status] || ''
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
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
                    <option value="ABERTA">Aberta</option>
                    <option value="AGENDADA">Agendada</option>
                    <option value="EM_ANDAMENTO">Em andamento</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
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
                      {formatarMoeda(assistencia.valorMateriais)}
                    </td>

                    <td>
                      {formatarMoeda(assistencia.valorTotal)}
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
    type="button"
    className="botao-materiais"
    onClick={() => {
      setMenuAberto(null)
      abrirMateriais(assistencia)
    }}
  >
    Materiais
  </button>

  <button
    type="button"
    className="botao-tres-pontos-assistencia"
    aria-label={`Mais opções da assistência ${assistencia.id}`}
    aria-expanded={menuAberto === assistencia.id}
    onClick={(event) =>
      alternarMenu(event, assistencia.id)
    }
  >
    ⋮
  </button>

  {menuAberto === assistencia.id && (
    <div
      className="menu-dropdown-assistencia"
      style={{
        top: `${posicaoMenu.top}px`,
        left: `${posicaoMenu.left}px`
      }}
    >
      <button
        type="button"
        onClick={() => {
          setMenuAberto(null)
          editarAssistencia(assistencia)
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
          excluirAssistencia(assistencia.id)
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

            <div className="secao-imagens">

  <div className="secao-imagens-header">
    <div>
      <h3>Imagens da assistência</h3>
      <p>
        Registre o problema e o resultado do atendimento.
      </p>
    </div>
  </div>

  <div className="upload-imagens">

    <form onSubmit={enviarImagem}>

      <div>
        <label>Etapa da imagem</label>

        <select
          value={etapaImagem}
          onChange={event => setEtapaImagem(event.target.value)}
        >
          <option
            value="PROBLEMA"
            disabled={
              !['ABERTA', 'AGENDADA'].includes(
                assistenciaSelecionada.status
              )
            }
          >
            Fotos do problema
          </option>

          <option
            value="APOS_ASSISTENCIA"
            disabled={
              assistenciaSelecionada.status !== 'CONCLUIDA'
            }
          >
            Fotos após a assistência
          </option>
        </select>
      </div>

      <div>
        <label>Selecionar imagens</label>

        <input
          id="arquivo-imagem-assistencia"
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={event => {
            const arquivo = event.target.files[0]

            if (!arquivo) return

            if (arquivo.size > 5 * 1024 * 1024) {
              alert('A imagem deve ter no máximo 5 MB.')
              event.target.value = ''
              setArquivoImagem(null)
              return
            }

            setArquivoImagem(arquivo)
          }}
          required
        />
      </div>

      <button
        type="submit"
        className="botao-enviar-imagem"
        disabled={!arquivoImagem}
      >
        Enviar imagem
      </button>

    </form>

    <small>
      Formatos aceitos: JPG, JPEG e PNG. Limite de 5 MB por imagem.
    </small>

  </div>

  {carregandoImagens ? (

    <p className="mensagem-imagens">
      Carregando imagens...
    </p>

  ) : (

    <>
      <div className="galeria-imagens">

        <h4>Fotos do problema</h4>

        <div className="imagens-grid">

          {imagens.filter(
            imagem => imagem.etapa === 'PROBLEMA'
          ).length === 0 ? (

            <p className="sem-imagens">
              Nenhuma imagem do problema cadastrada.
            </p>

          ) : (

            imagens
              .filter(imagem => imagem.etapa === 'PROBLEMA')
              .map(imagem => (
                <div className="imagem-card" key={imagem.id}>

                  <a
                    href={imagem.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Visualizar imagem"
                  >
                    <img
                      src={imagem.url}
                      alt={imagem.nomeOriginal}
                    />
                  </a>

                  <span title={imagem.nomeOriginal}>
                    {imagem.nomeOriginal}
                  </span>

                  <button
                    type="button"
                    className="botao-excluir-imagem"
                    onClick={() => excluirImagem(imagem)}
                  >
                    Excluir
                  </button>

                </div>
              ))

          )}

        </div>

      </div>

      <div className="galeria-imagens">

        <h4>Fotos após a assistência</h4>

        <div className="imagens-grid">

          {imagens.filter(
            imagem => imagem.etapa === 'APOS_ASSISTENCIA'
          ).length === 0 ? (

            <p className="sem-imagens">
              Nenhuma imagem após a assistência cadastrada.
            </p>

          ) : (

            imagens
              .filter(imagem => imagem.etapa === 'APOS_ASSISTENCIA')
              .map(imagem => (
                <div className="imagem-card" key={imagem.id}>

                  <a
                    href={imagem.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Visualizar imagem"
                  >
                    <img
                      src={imagem.url}
                      alt={imagem.nomeOriginal}
                    />
                  </a>

                  <span title={imagem.nomeOriginal}>
                    {imagem.nomeOriginal}
                  </span>

                  <button
                    type="button"
                    className="botao-excluir-imagem"
                    onClick={() => excluirImagem(imagem)}
                  >
                    Excluir
                  </button>

                </div>
              ))

          )}

        </div>

      </div>
    </>

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