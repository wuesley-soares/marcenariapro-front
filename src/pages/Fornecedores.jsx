import { useEffect, useState } from 'react'
import api from '../services/api'
import './Fornecedores.css'

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
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
  telefone1: '',
  telefone2: '',
  celular: '',
  whatsappTipo: 'TELEFONE_1'
}

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [fornecedorEditando, setFornecedorEditando] = useState(null)
  const [fornecedorDetalhes, setFornecedorDetalhes] = useState(null)

  const [pesquisa, setPesquisa] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoCep, setCarregandoCep] = useState(false)

  const [formulario, setFormulario] = useState(formularioInicial)
  const [endereco, setEndereco] = useState(enderecoInicial)

  const [vendedores, setVendedores] = useState([])
  const [novoVendedor, setNovoVendedor] = useState({
    nome: '',
    telefone: ''
  })

  useEffect(() => {
    carregarFornecedores()
  }, [])

  async function carregarFornecedores() {
    setCarregando(true)

    try {
      const resposta = await api.get('/fornecedores')
      setFornecedores(resposta.data || [])
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
      alert(
        error.response?.data?.message ||
        'Não foi possível carregar os fornecedores.'
      )
    } finally {
      setCarregando(false)
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

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11)

    if (numeros.length <= 2) return numeros

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  }

  function formatarCnpj(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 14)

    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  function alterarCnpj(event) {
    setFormulario((anterior) => ({
      ...anterior,
      cnpj: formatarCnpj(event.target.value)
    }))
  }

  function alterarTelefoneFornecedor(event) {
    const { name, value } = event.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: formatarTelefone(value)
    }))
  }

  function abrirWhatsApp(telefone, nome = 'contato') {
    const numero = telefone?.replace(/\D/g, '')

    if (!numero) {
      alert(`${nome} não possui telefone cadastrado.`)
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
    const numeros = event.target.value
      .replace(/\D/g, '')
      .slice(0, 8)

    const cepFormatado = numeros.length > 5
      ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
      : numeros

    setEndereco((anterior) => ({
      ...anterior,
      cep: cepFormatado
    }))

    if (numeros.length === 8) {
      buscarCep(numeros)
    }
  }

  function novoFornecedor() {
    setFornecedorEditando(null)
    setFormulario({ ...formularioInicial })
    setEndereco({ ...enderecoInicial })
    setVendedores([])
    setNovoVendedor({ nome: '', telefone: '' })
    setMostrarFormulario(true)
  }

  function editarFornecedor(fornecedor) {
    setFornecedorEditando(fornecedor)

    setFormulario({
      nomeFantasia: fornecedor.nomeFantasia || '',
      razaoSocial: fornecedor.razaoSocial || '',
      cnpj: formatarCnpj(fornecedor.cnpj || ''),
      telefone1: formatarTelefone(fornecedor.telefone1 || ''),
      telefone2: formatarTelefone(fornecedor.telefone2 || ''),
      celular: formatarTelefone(fornecedor.celular || ''),
      whatsappTipo: fornecedor.whatsappTipo || 'TELEFONE_1'
    })

    setEndereco({
      cep: fornecedor.cep || '',
      estado: fornecedor.estado || '',
      cidade: fornecedor.cidade || '',
      bairro: fornecedor.bairro || '',
      rua: fornecedor.rua || '',
      numero: fornecedor.numero || '',
      complemento: fornecedor.complemento || ''
    })

    setVendedores(
      (fornecedor.vendedores || []).map((vendedor) => ({
        id: vendedor.id,
        nome: vendedor.nome || '',
        telefone: formatarTelefone(vendedor.telefone || '')
      }))
    )

    setNovoVendedor({ nome: '', telefone: '' })
    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setFornecedorEditando(null)
    setFormulario({ ...formularioInicial })
    setEndereco({ ...enderecoInicial })
    setVendedores([])
    setNovoVendedor({ nome: '', telefone: '' })
  }

  function adicionarVendedor() {
    const nome = novoVendedor.nome.trim()
    const telefone = novoVendedor.telefone.replace(/\D/g, '')

    if (!nome || !telefone) {
      alert('Informe o nome e o telefone do contato.')
      return
    }

    if (telefone.length !== 10 && telefone.length !== 11) {
      alert('Informe um telefone válido com DDD.')
      return
    }

    setVendedores((anterior) => [
      ...anterior,
      {
        nome,
        telefone: formatarTelefone(telefone)
      }
    ])

    setNovoVendedor({ nome: '', telefone: '' })
  }

  function removerVendedor(index) {
    setVendedores((anterior) =>
      anterior.filter((_, i) => i !== index)
    )
  }

  function obterTelefoneWhatsApp(fornecedor) {
    const telefones = {
      TELEFONE_1: fornecedor.telefone1,
      TELEFONE_2: fornecedor.telefone2,
      CELULAR: fornecedor.celular
    }

    return telefones[fornecedor.whatsappTipo] || ''
  }

  function nomeTipoWhatsApp(tipo) {
    const nomes = {
      TELEFONE_1: 'Telefone 1',
      TELEFONE_2: 'Telefone 2',
      CELULAR: 'Celular'
    }

    return nomes[tipo] || 'Não definido'
  }

  function montarPayload() {
    return {
      nomeFantasia: formulario.nomeFantasia.trim(),
      razaoSocial: formulario.razaoSocial.trim(),
      cnpj: formulario.cnpj.replace(/\D/g, ''),
      cep: endereco.cep.replace(/\D/g, ''),
      estado: endereco.estado.trim().toUpperCase(),
      cidade: endereco.cidade.trim(),
      bairro: endereco.bairro.trim(),
      rua: endereco.rua.trim(),
      numero: endereco.numero.trim(),
      complemento: endereco.complemento.trim(),
      telefone1: formulario.telefone1.replace(/\D/g, ''),
      telefone2: formulario.telefone2.replace(/\D/g, ''),
      celular: formulario.celular.replace(/\D/g, ''),
      whatsappTipo: formulario.whatsappTipo,
      vendedores: vendedores.map((vendedor) => ({
        nome: vendedor.nome.trim(),
        telefone: vendedor.telefone.replace(/\D/g, '')
      }))
    }
  }

  async function salvarFornecedor(event) {
    event.preventDefault()

    const telefoneWhatsApp = {
      TELEFONE_1: formulario.telefone1,
      TELEFONE_2: formulario.telefone2,
      CELULAR: formulario.celular
    }[formulario.whatsappTipo]

    if (!telefoneWhatsApp?.replace(/\D/g, '')) {
      alert('O número selecionado para WhatsApp precisa estar preenchido.')
      return
    }

    if (formulario.cnpj.replace(/\D/g, '').length !== 14) {
      alert('Informe um CNPJ com 14 números.')
      return
    }

    const telefones = [
      formulario.telefone1,
      formulario.telefone2,
      formulario.celular
    ]

    for (const telefone of telefones) {
      const quantidade = telefone.replace(/\D/g, '').length

      if (quantidade > 0 && quantidade !== 10 && quantidade !== 11) {
        alert('Confira os telefones informados. Use DDD e número.')
        return
      }
    }

    const payload = montarPayload()

    try {
      if (fornecedorEditando) {
        await api.put(
          `/fornecedores/${fornecedorEditando.id}`,
          payload
        )

        alert('Fornecedor atualizado com sucesso!')
      } else {
        await api.post('/fornecedores', payload)
        alert('Fornecedor cadastrado com sucesso!')
      }

      cancelarFormulario()
      carregarFornecedores()
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error)

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao salvar fornecedor. Confira os dados e tente novamente.'
      )
    }
  }

  async function excluirFornecedor(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este fornecedor?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/fornecedores/${id}`)
      alert('Fornecedor excluído com sucesso!')
      carregarFornecedores()
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error)

      alert(
        error.response?.data?.message ||
        'Não foi possível excluir o fornecedor.'
      )
    }
  }

  function formatarDocumento(documento) {
    const numeros = documento?.replace(/\D/g, '') || ''

    if (numeros.length !== 14) return documento || '-'

    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    )
  }

  const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {
    const termo = pesquisa.toLowerCase().trim()

    return (
      fornecedor.nomeFantasia?.toLowerCase().includes(termo) ||
      fornecedor.razaoSocial?.toLowerCase().includes(termo) ||
      fornecedor.cnpj?.toLowerCase().includes(termo) ||
      formatarDocumento(fornecedor.cnpj).toLowerCase().includes(termo) ||
      fornecedor.cidade?.toLowerCase().includes(termo) ||
      fornecedor.telefone1?.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="fornecedores-page">
      <div className="fornecedores-header">
        <div>
          <h1>Fornecedores</h1>
          <p>Gerencie os fornecedores e seus contatos comerciais.</p>
        </div>

        <button onClick={novoFornecedor}>
          Novo fornecedor
        </button>
      </div>

      <div className="fornecedores-resumo">
        <div className="fornecedor-resumo-card">
          <span>Total de fornecedores</span>
          <strong>{fornecedores.length}</strong>
        </div>

        <div className="fornecedor-resumo-card">
          <span>Fornecedores com contatos</span>
          <strong>
            {fornecedores.filter(
              (fornecedor) => fornecedor.vendedores?.length > 0
            ).length}
          </strong>
        </div>

        <div className="fornecedor-resumo-card">
          <span>Total de contatos comerciais</span>
          <strong>
            {fornecedores.reduce(
              (total, fornecedor) =>
                total + (fornecedor.vendedores?.length || 0),
              0
            )}
          </strong>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="fornecedor-formulario">
          <h2>
            {fornecedorEditando ? 'Editar fornecedor' : 'Novo fornecedor'}
          </h2>

          <form onSubmit={salvarFornecedor}>
            <div className="fornecedor-secao-titulo">
              <h3>Dados da empresa</h3>
              <p>Informe os dados principais do fornecedor.</p>
            </div>

            <div>
              <label>Nome fantasia *</label>
              <input
                type="text"
                name="nomeFantasia"
                value={formulario.nomeFantasia}
                onChange={alterarCampo}
                placeholder="Nome fantasia"
                required
              />
            </div>

            <div>
              <label>Razão social</label>
              <input
                type="text"
                name="razaoSocial"
                value={formulario.razaoSocial}
                onChange={alterarCampo}
                placeholder="Razão social (opcional)"
              />
            </div>

            <div>
              <label>CNPJ *</label>
              <input
                type="text"
                name="cnpj"
                value={formulario.cnpj}
                onChange={alterarCnpj}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                required
              />
            </div>

            <div className="fornecedor-secao-titulo">
              <h3>Telefones da empresa</h3>
              <p>
                O Telefone 1 é obrigatório. Os demais são opcionais.
                Escolha qual número será utilizado no WhatsApp.
              </p>
            </div>

            <div>
              <label>Telefone 1 *</label>
              <input
                type="tel"
                name="telefone1"
                value={formulario.telefone1}
                onChange={alterarTelefoneFornecedor}
                placeholder="(00) 0000-0000"
                required
              />
            </div>

            <div>
              <label>Telefone 2</label>
              <input
                type="tel"
                name="telefone2"
                value={formulario.telefone2}
                onChange={alterarTelefoneFornecedor}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label>Celular</label>
              <input
                type="tel"
                name="celular"
                value={formulario.celular}
                onChange={alterarTelefoneFornecedor}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="fornecedor-whatsapp-selecao">
              <label>Qual número será usado no WhatsApp? *</label>

              <select
                name="whatsappTipo"
                value={formulario.whatsappTipo}
                onChange={alterarCampo}
                required
              >
                <option value="TELEFONE_1">Telefone 1</option>
                <option
                  value="TELEFONE_2"
                  disabled={!formulario.telefone2.replace(/\D/g, '')}
                >
                  Telefone 2
                </option>
                <option
                  value="CELULAR"
                  disabled={!formulario.celular.replace(/\D/g, '')}
                >
                  Celular
                </option>
              </select>

              <small>
                O botão do WhatsApp na listagem utilizará o número selecionado.
              </small>
            </div>

            <div className="fornecedor-secao-titulo">
              <h3>Endereço</h3>
              <p>Digite o CEP para preencher o endereço automaticamente.</p>
            </div>

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
                <small className="fornecedor-ajuda">
                  Consultando CEP...
                </small>
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
                placeholder="PR"
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
              <label>Complemento</label>
              <input
                type="text"
                name="complemento"
                value={endereco.complemento}
                onChange={alterarEndereco}
                placeholder="Sala, bloco, referência..."
              />
            </div>

            <div className="fornecedor-secao-titulo fornecedor-contatos-titulo">
              <h3>Contatos comerciais</h3>
              <p>
                Cadastre vendedores ou representantes vinculados a este fornecedor.
              </p>
            </div>

            <div className="fornecedor-novo-contato">
              <div>
                <label>Nome do contato</label>
                <input
                  type="text"
                  value={novoVendedor.nome}
                  onChange={(event) =>
                    setNovoVendedor((anterior) => ({
                      ...anterior,
                      nome: event.target.value
                    }))
                  }
                  placeholder="Nome do vendedor"
                />
              </div>

              <div>
                <label>Telefone do contato</label>
                <input
                  type="tel"
                  value={novoVendedor.telefone}
                  onChange={(event) =>
                    setNovoVendedor((anterior) => ({
                      ...anterior,
                      telefone: formatarTelefone(event.target.value)
                    }))
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>

              <button
                type="button"
                onClick={adicionarVendedor}
                className="fornecedor-adicionar-contato"
              >
                + Adicionar contato
              </button>
            </div>

            {vendedores.length > 0 && (
              <div className="fornecedor-contatos-lista">
                <h4>Contatos adicionados ({vendedores.length})</h4>

                {vendedores.map((vendedor, index) => (
                  <div className="fornecedor-contato-item" key={index}>
                    <div>
                      <strong>{vendedor.nome}</strong>
                      <span>{vendedor.telefone}</span>
                    </div>

                    <div className="fornecedor-contato-acoes">
                      <button
                        type="button"
                        className="botao-whatsapp"
                        title={`Conversar com ${vendedor.nome}`}
                        onClick={() =>
                          abrirWhatsApp(vendedor.telefone, vendedor.nome)
                        }
                      >
                        <img src="/whatsapp-icon.png" alt="WhatsApp" />
                      </button>

                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() => removerVendedor(index)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="fornecedor-formulario-botoes">
              <button type="button" onClick={cancelarFormulario}>
                Cancelar
              </button>

              <button type="submit">
                {fornecedorEditando ? 'Salvar alterações' : 'Cadastrar fornecedor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="fornecedores-tabela">
        <div className="fornecedores-tabela-header">
          <div>
            <h2>Fornecedores cadastrados</h2>
            <span>
              {fornecedoresFiltrados.length}{' '}
              {fornecedoresFiltrados.length === 1
                ? 'fornecedor encontrado'
                : 'fornecedores encontrados'}
            </span>
          </div>

          <div className="fornecedores-pesquisa">
            <input
              type="text"
              placeholder="Pesquisar por nome, CNPJ, telefone ou cidade..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>
        </div>

        {carregando ? (
          <div className="fornecedores-vazio">
            <p>Carregando fornecedores...</p>
          </div>
        ) : fornecedoresFiltrados.length === 0 ? (
          <div className="fornecedores-vazio">
            <h3>
              {fornecedores.length === 0
                ? 'Nenhum fornecedor cadastrado'
                : 'Nenhum fornecedor encontrado'}
            </h3>

            <p>
              {fornecedores.length === 0
                ? 'Cadastre um fornecedor para começar.'
                : 'Tente pesquisar por outro nome, CNPJ ou telefone.'}
            </p>
          </div>
        ) : (
          <div className="fornecedores-tabela-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nome fantasia</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>Cidade</th>
                  <th>Contatos</th>
                  <th>WhatsApp</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {fornecedoresFiltrados.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>
                      <strong>{fornecedor.nomeFantasia}</strong>
                    </td>

                    <td>{formatarDocumento(fornecedor.cnpj)}</td>

                    <td>{formatarTelefone(fornecedor.telefone1 || '')}</td>

                    <td>
                      {fornecedor.cidade
                        ? `${fornecedor.cidade}/${fornecedor.estado || ''}`
                        : '-'}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="fornecedor-botao-detalhes"
                        onClick={() => setFornecedorDetalhes(fornecedor)}
                      >
                        {fornecedor.vendedores?.length || 0} contato(s)
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="botao-whatsapp"
                        title={`WhatsApp: ${nomeTipoWhatsApp(fornecedor.whatsappTipo)}`}
                        onClick={() =>
                          abrirWhatsApp(
                            obterTelefoneWhatsApp(fornecedor),
                            fornecedor.nomeFantasia
                          )
                        }
                      >
                        <img src="/whatsapp-icon.png" alt="WhatsApp" />
                      </button>
                    </td>

                    <td>
                      <div className="fornecedor-acoes">
                        <button
                          type="button"
                          className="botao-editar"
                          onClick={() => editarFornecedor(fornecedor)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="botao-excluir"
                          onClick={() => excluirFornecedor(fornecedor.id)}
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
        )}
      </div>

      {fornecedorDetalhes && (
        <div
          className="fornecedor-modal-fundo"
          onClick={() => setFornecedorDetalhes(null)}
        >
          <div
            className="fornecedor-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="fornecedor-modal-header">
              <div>
                <h2>{fornecedorDetalhes.nomeFantasia}</h2>
                <p>Informações do fornecedor</p>
              </div>

              <button
                type="button"
                onClick={() => setFornecedorDetalhes(null)}
              >
                Fechar
              </button>
            </div>

            <div className="fornecedor-detalhes-grid">
              <div>
                <span>Razão social</span>
                <strong>{fornecedorDetalhes.razaoSocial || '-'}</strong>
              </div>

              <div>
                <span>CNPJ</span>
                <strong>{formatarDocumento(fornecedorDetalhes.cnpj)}</strong>
              </div>

              <div>
                <span>Telefone 1</span>
                <strong>{formatarTelefone(fornecedorDetalhes.telefone1 || '')}</strong>
              </div>

              <div>
                <span>Telefone 2</span>
                <strong>
                  {fornecedorDetalhes.telefone2
                    ? formatarTelefone(fornecedorDetalhes.telefone2)
                    : '-'}
                </strong>
              </div>

              <div>
                <span>Celular</span>
                <strong>
                  {fornecedorDetalhes.celular
                    ? formatarTelefone(fornecedorDetalhes.celular)
                    : '-'}
                </strong>
              </div>

              <div>
                <span>Número selecionado para WhatsApp</span>
                <strong>{nomeTipoWhatsApp(fornecedorDetalhes.whatsappTipo)}</strong>
              </div>

              <div className="fornecedor-detalhes-endereco">
                <span>Endereço</span>
                <strong>
                  {[
                    fornecedorDetalhes.rua,
                    fornecedorDetalhes.numero,
                    fornecedorDetalhes.complemento,
                    fornecedorDetalhes.bairro,
                    fornecedorDetalhes.cidade,
                    fornecedorDetalhes.estado,
                    fornecedorDetalhes.cep
                  ].filter(Boolean).join(', ') || '-'}
                </strong>
              </div>
            </div>

            <div className="fornecedor-modal-contatos">
              <h3>Contatos comerciais</h3>

              {!fornecedorDetalhes.vendedores?.length ? (
                <p>Nenhum contato comercial cadastrado.</p>
              ) : (
                fornecedorDetalhes.vendedores.map((vendedor) => (
                  <div
                    className="fornecedor-contato-item"
                    key={vendedor.id || vendedor.nome}
                  >
                    <div>
                      <strong>{vendedor.nome}</strong>
                      <span>{formatarTelefone(vendedor.telefone || '')}</span>
                    </div>

                    <button
                      type="button"
                      className="botao-whatsapp"
                      title={`Conversar com ${vendedor.nome}`}
                      onClick={() =>
                        abrirWhatsApp(vendedor.telefone, vendedor.nome)
                      }
                    >
                      <img src="/whatsapp-icon.png" alt="WhatsApp" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fornecedores