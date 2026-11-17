
import { useEffect, useState } from 'react'
import { Trash2 } from "lucide-react";
import api from '../services/api'
import './Clientes.css'
import './Projetos.css'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [carregandoCep, setCarregandoCep] = useState(false)
  const [pesquisa, setPesquisa] = useState('')
  const [financeiros, setFinanceiros] = useState({})
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('TODOS')
  const [menuAberto, setMenuAberto] = useState(null)

  const enderecoInicial = {
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    complemento: ''
  }

  const formularioInicial = {
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    endereco: ''
  }

  const [endereco, setEndereco] = useState(enderecoInicial)
  const [formulario, setFormulario] = useState(formularioInicial)

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    try {
      const resposta = await api.get('/clientes')
      const listaClientes = resposta.data || []

      setClientes(listaClientes)

      const resultados = await Promise.all(
        listaClientes.map(async (cliente) => {
          try {
            const respostaFinanceira = await api.get(
              `/clientes/${cliente.id}/financeiro`
            )

            return [cliente.id, respostaFinanceira.data]
          } catch (error) {
            console.error(
              `Erro ao carregar financeiro do cliente ${cliente.id}:`,
              error
            )

            return [cliente.id, null]
          }
        })
      )

      setFinanceiros(Object.fromEntries(resultados))
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      alert('Não foi possível carregar os clientes.')
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  function alterarEndereco(event) {
    const { name, value } = event.target

    setEndereco((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  function alternarMenu(id) {
    setMenuAberto((atual) => atual === id ? null : id)
  }

  function abrirWhatsApp(telefone) {
    const numero = telefone?.replace(/\D/g, '')

    if (!numero) {
      alert('Cliente não possui telefone cadastrado.')
      return
    }

    const numeroCompleto = numero.startsWith('55')
      ? numero
      : `55${numero}`

    window.open(
      `https://wa.me/${numeroCompleto}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  async function buscarCep(cepInformado) {
    const cep = cepInformado.replace(/\D/g, '')

    if (cep.length !== 8) return

    setCarregandoCep(true)

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      )

      if (!resposta.ok) {
        throw new Error('Não foi possível consultar o CEP.')
      }

      const dados = await resposta.json()

      if (dados.erro) {
        alert('CEP não encontrado. Confira o número digitado.')
        return
      }

      setEndereco((anterior) => ({
        ...anterior,
        cep: dados.cep || cep,
        estado: dados.uf || '',
        cidade: dados.localidade || '',
        bairro: dados.bairro || '',
        rua: dados.logradouro || ''
      }))
    } catch (error) {
      console.error('Erro ao consultar CEP:', error)
      alert('Não foi possível consultar o CEP. Tente novamente.')
    } finally {
      setCarregandoCep(false)
    }
  }

  function alterarCep(event) {
    const valor = event.target.value
      .replace(/\D/g, '')
      .slice(0, 8)

    const cepFormatado = valor.length > 5
      ? `${valor.slice(0, 5)}-${valor.slice(5)}`
      : valor

    setEndereco((anterior) => ({
      ...anterior,
      cep: cepFormatado
    }))

    if (valor.length === 8) {
      buscarCep(valor)
    }
  }

  function montarEndereco(dados) {
    const partes = [
      dados.rua.trim(),
      dados.numero.trim(),
      dados.complemento.trim(),
      dados.bairro.trim(),
      dados.cidade.trim() && dados.estado.trim()
        ? `${dados.cidade.trim()} - ${dados.estado.trim()}`
        : dados.cidade.trim() || dados.estado.trim(),
      dados.cep.trim()
        ? `CEP: ${dados.cep.trim()}`
        : ''
    ]

    return partes.filter(Boolean).join(', ')
  }

  function separarEndereco(texto) {
    const resultado = { ...enderecoInicial }

    if (!texto) return resultado

    // Compatibilidade com endereços antigos.
    if (!texto.includes('CEP:')) {
      resultado.rua = texto
      return resultado
    }

    const cepEncontrado = texto.match(/CEP:\s*(\d{5}-?\d{3})/i)

    if (cepEncontrado) {
      resultado.cep = cepEncontrado[1]
    }

    const semCep = texto.replace(
      /,?\s*CEP:\s*\d{5}-?\d{3}/i,
      ''
    )

    const partes = semCep.split(',').map((parte) => parte.trim())

    resultado.rua = partes[0] || ''
    resultado.numero = partes[1] || ''
    resultado.complemento = partes[2] || ''
    resultado.bairro = partes[3] || ''

    const cidadeEstado = partes[4] || ''
    const divisao = cidadeEstado.match(/^(.*)\s-\s([A-Z]{2})$/)

    if (divisao) {
      resultado.cidade = divisao[1]
      resultado.estado = divisao[2]
    } else {
      resultado.cidade = cidadeEstado
    }

    return resultado
  }

  function novoCliente() {
    setClienteEditando(null)
    setFormulario({ ...formularioInicial })
    setEndereco({ ...enderecoInicial })
    setMenuAberto(null)
    setMostrarFormulario(true)
  }

  function editarCliente(cliente) {
    setClienteEditando(cliente)

    setFormulario({
      nome: cliente.nome || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      cpfCnpj: cliente.cpfCnpj || '',
      endereco: cliente.endereco || ''
    })

    setEndereco(separarEndereco(cliente.endereco || ''))
    setMenuAberto(null)
    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setClienteEditando(null)
    setFormulario({ ...formularioInicial })
    setEndereco({ ...enderecoInicial })
  }

  async function salvarCliente(event) {
    event.preventDefault()

    const enderecoCompleto = montarEndereco(endereco)

    const dadosCliente = {
      ...formulario,
      endereco: enderecoCompleto
    }

    try {
      if (clienteEditando) {
        await api.put(
          `/clientes/${clienteEditando.id}`,
          dadosCliente
        )

        alert('Cliente atualizado com sucesso!')
      } else {
        await api.post('/clientes', dadosCliente)
        alert('Cliente cadastrado com sucesso!')
      }

      cancelarFormulario()
      await carregarClientes()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar cliente.'

      alert(mensagem)
    }
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este cliente?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/clientes/${id}`)

      setMenuAberto(null)
      alert('Cliente excluído com sucesso!')
      await carregarClientes()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir cliente.'

      alert(mensagem)
    }
  }

  function formatarCpfCnpj(documento) {
    if (!documento) return '-'

    const numeros = documento.replace(/\D/g, '')

    if (numeros.length === 11) {
      return numeros.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        '$1.$2.$3-$4'
      )
    }

    if (numeros.length === 14) {
      return numeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      )
    }

    return documento
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const totalPedidos = Object.values(financeiros).reduce(
    (total, financeiro) =>
      total + Number(financeiro?.totalPedidos || 0),
    0
  )

  const totalPago = Object.values(financeiros).reduce(
    (total, financeiro) =>
      total + Number(financeiro?.totalPago || 0),
    0
  )

  const saldoReceber = Object.values(financeiros).reduce(
    (total, financeiro) =>
      total + Number(financeiro?.saldoReceber || 0),
    0
  )

  const quantidadeQuitados = Object.values(financeiros).filter(
    (financeiro) => financeiro?.situacao === 'QUITADO'
  ).length

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = pesquisa.toLowerCase().trim()

    const correspondePesquisa =
      cliente.nome?.toLowerCase().includes(termo) ||
      cliente.email?.toLowerCase().includes(termo) ||
      cliente.telefone?.toLowerCase().includes(termo) ||
      cliente.cpfCnpj?.toLowerCase().includes(termo) ||
      formatarCpfCnpj(cliente.cpfCnpj).toLowerCase().includes(termo)

    const situacao = financeiros[cliente.id]?.situacao

    const correspondeFinanceiro =
      filtroFinanceiro === 'TODOS' ||
      situacao === filtroFinanceiro

    return correspondePesquisa && correspondeFinanceiro
  })

  function obterDescricaoSituacao(situacao) {
    const situacoes = {
      QUITADO: 'Quitado',
      COM_SALDO_A_RECEBER: 'Com saldo a receber',
      SEM_PEDIDOS: 'Sem pedidos'
    }

    return situacoes[situacao] || 'Não identificado'
  }

  return (
    <div className={`clientes ${mostrarFormulario ? 'formulario-aberto' : ''}`}>
      {!mostrarFormulario && (
        <>
          <div className="clientes-resumo">
            <div className="cliente-resumo-card">
              <span>Total em pedidos</span>
              <strong>{formatarMoeda(totalPedidos)}</strong>
            </div>

            <div className="cliente-resumo-card">
              <span>Total recebido</span>
              <strong>{formatarMoeda(totalPago)}</strong>
            </div>

            <div className="cliente-resumo-card">
              <span>Saldo a receber</span>
              <strong>{formatarMoeda(saldoReceber)}</strong>
            </div>

            <div className="cliente-resumo-card">
              <span>Clientes quitados</span>
              <strong>{quantidadeQuitados}</strong>
            </div>
          </div>

          <div className="clientes-header">
            <div>
              <h1>Clientes</h1>
              <p>Clientes cadastrados na marcenaria</p>
            </div>

            <button type="button" onClick={novoCliente}>
              Novo cliente
            </button>
          </div>
        </>
      )}

      {mostrarFormulario && (
        <div className="cliente-formulario-tela">
          <div className="cliente-formulario">
            <h2>
              {clienteEditando ? 'Editar cliente' : 'Novo cliente'}
            </h2>

            <form onSubmit={salvarCliente}>
              <div>
                <label>Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div>
                <label>CPF/CNPJ</label>
                <input
                  type="text"
                  name="cpfCnpj"
                  value={formulario.cpfCnpj}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div>
                <label>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formulario.telefone}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div>
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div className="endereco-formulario">
                <h3>Endereço</h3>

                <div>
                  <label>CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={endereco.cep}
                    onChange={alterarCep}
                    onBlur={() => buscarCep(endereco.cep)}
                    placeholder="00000-000"
                    maxLength={9}
                  />

                  {carregandoCep && (
                    <small>Consultando CEP...</small>
                  )}
                </div>

                <div>
                  <label>Estado (UF)</label>
                  <input
                    type="text"
                    name="estado"
                    value={endereco.estado}
                    onChange={alterarEndereco}
                    maxLength={2}
                  />
                </div>

                <div>
                  <label>Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={endereco.cidade}
                    onChange={alterarEndereco}
                  />
                </div>

                <div>
                  <label>Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    value={endereco.bairro}
                    onChange={alterarEndereco}
                  />
                </div>

                <div>
                  <label>Rua</label>
                  <input
                    type="text"
                    name="rua"
                    value={endereco.rua}
                    onChange={alterarEndereco}
                  />
                </div>

                <div>
                  <label>Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={endereco.numero}
                    onChange={alterarEndereco}
                  />
                </div>

                <div>
                  <label>Complemento (opcional)</label>
                  <input
                    type="text"
                    name="complemento"
                    value={endereco.complemento}
                    onChange={alterarEndereco}
                  />
                </div>
              </div>

              <div className="formulario-botoes">
                <button
                  type="button"
                  onClick={cancelarFormulario}
                >
                  Cancelar
                </button>

                <button type="submit">
                  {clienteEditando ? 'Salvar alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!mostrarFormulario && (
        <div className="clientes-tabela">
          <div className="clientes-tabela-header">
            <div>
              <h2>Clientes cadastrados</h2>
              <span>
                {clientesFiltrados.length}{' '}
                {clientesFiltrados.length === 1
                  ? 'cliente encontrado'
                  : 'clientes encontrados'}
              </span>

              <div className="clientes-filtros">
                <select
                  value={filtroFinanceiro}
                  onChange={(event) => setFiltroFinanceiro(event.target.value)}
                >
                  <option value="TODOS">Todas as situações</option>
                  <option value="QUITADO">Quitado</option>
                  <option value="COM_SALDO_A_RECEBER">
                    Com saldo a receber
                  </option>
                  <option value="SEM_PEDIDOS">Sem pedidos</option>
                </select>
              </div>
            </div>

            <div className="clientes-pesquisa">
              <input
                type="text"
                placeholder="Pesquisar por nome, CPF/CNPJ, telefone ou e-mail..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
              />
            </div>
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="clientes-vazio">
              <h3>
                {clientes.length === 0
                  ? 'Nenhum cliente cadastrado'
                  : 'Nenhum cliente encontrado'}
              </h3>

              <p>
                {clientes.length === 0
                  ? 'Cadastre um novo cliente para começar.'
                  : 'Tente pesquisar por outro nome, documento, telefone ou e-mail.'}
              </p>
            </div>
          ) : (
            <div className="clientes-tabela-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF/CNPJ</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Situação financeira</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((cliente) => {
                    const situacao = financeiros[cliente.id]?.situacao
                    const carregandoFinanceiro =
                      !Object.prototype.hasOwnProperty.call(
                        financeiros,
                        cliente.id
                      )

                    return (
                      <tr
                        key={cliente.id}
                        className="linha-com-menu"
                      >
                        <td>{cliente.nome}</td>
                        <td>{formatarCpfCnpj(cliente.cpfCnpj)}</td>
                        <td>{cliente.telefone}</td>
                        <td>{cliente.email}</td>

                        <td>
                            {carregandoFinanceiro ? (
                              'Carregando...'
                            ) : (
                              <span
                                className={`badge-situacao-financeira ${
                                  situacao === 'QUITADO'
                                    ? 'situacao-quitado'
                                    : situacao === 'COM_SALDO_A_RECEBER'
                                    ? 'situacao-pendente'
                                    : situacao === 'SEM_PEDIDOS'
                                    ? 'situacao-sem-pedidos'
                                    : ''
                                }`}
                              >
                                {obterDescricaoSituacao(situacao)}
                              </span>
                            )}
                        </td>

                        <td>
                          <div className="acoes">
                            <div className="menu-acoes-linha">
                              <button
                                type="button"
                                className="botao-tres-pontos"
                                aria-label={`Mais opções para ${cliente.nome}`}
                                aria-expanded={menuAberto === cliente.id}
                                onClick={() => alternarMenu(cliente.id)}
                              >
                                ⋮
                              </button>

                              {menuAberto === cliente.id && (
                                <div className="menu-dropdown-linha">
                                  <button
                                    type="button"
                                    onClick={() => editarCliente(cliente)}
                                  >
                                    <span>✎</span> Editar
                                  </button>

                                  <button
                                    type="button"
                                    className="opcao-excluir"
                                    onClick={() => excluirCliente(cliente.id)}
                                  >
                                    <span>🗑️</span> Excluir
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              className="botao-whatsapp"
                              onClick={() => abrirWhatsApp(cliente.telefone)}
                              type="button"
                              title="Conversar pelo WhatsApp"
                              aria-label={`Conversar com ${cliente.nome} pelo WhatsApp`}
                            >
                              <img
                                src="/whatsapp-icon.png"
                                alt=""
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Clientes
