
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Clientes.css'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [carregandoCep, setCarregandoCep] = useState(false)

  const [endereco, setEndereco] = useState({
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    complemento: ''
  })

  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    endereco: ''
  })

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    try {
      const resposta = await api.get('/clientes')
      setClientes(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
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

    const cepFormatado =
      valor.length > 5
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
    const resultado = {
      cep: '',
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      complemento: ''
    }

    if (!texto) return resultado

    // Compatibilidade com endereços antigos que não seguem o formato novo.
    if (!texto.includes('CEP:')) {
      resultado.rua = texto
      return resultado
    }

    const cepEncontrado = texto.match(/CEP:\s*(\d{5}-?\d{3})/i)
    if (cepEncontrado) resultado.cep = cepEncontrado[1]

    const semCep = texto.replace(/,?\s*CEP:\s*\d{5}-?\d{3}/i, '')
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

    setFormulario({
      nome: '',
      email: '',
      telefone: '',
      cpfCnpj: '',
      endereco: ''
    })

    setEndereco({
      cep: '',
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      complemento: ''
    })

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
    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setClienteEditando(null)

    setFormulario({
      nome: '',
      email: '',
      telefone: '',
      cpfCnpj: '',
      endereco: ''
    })

    setEndereco({
      cep: '',
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      complemento: ''
    })
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
      carregarClientes()
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

      alert('Cliente excluído com sucesso!')
      carregarClientes()
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

  return (
    <div className="clientes">
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Clientes cadastrados na marcenaria</p>
        </div>

        <button onClick={novoCliente}>
          Novo cliente
        </button>
      </div>

      {mostrarFormulario && (
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

                {carregandoCep && <small>Consultando CEP...</small>}
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
      )}

      <div className="clientes-tabela">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{formatarCpfCnpj(cliente.cpfCnpj)}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td>
                  <div className="acoes">
                    <button
                      className="botao-editar"
                      onClick={() => editarCliente(cliente)}
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() => excluirCliente(cliente.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Clientes
