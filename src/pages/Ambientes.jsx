
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from "lucide-react";
import api from '../services/api'
import './Ambientes.css'

function Ambientes() {
  const { projetoId } = useParams()
  const navigate = useNavigate()

  const [ambientes, setAmbientes] = useState([])
  const [nomeProjeto, setNomeProjeto] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ambienteEditando, setAmbienteEditando] = useState(null)
  const [pesquisa, setPesquisa] = useState('')
  const [documento, setDocumento] = useState(null)
  const [menuAberto, setMenuAberto] = useState(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: ''
  })

  useEffect(() => {
    carregarProjeto()
    carregarAmbientes()
  }, [projetoId])

  async function carregarProjeto() {
    try {
      const resposta = await api.get(`/projetos/${projetoId}`)
      setNomeProjeto(resposta.data.nome || '')
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
    }
  }

  async function carregarAmbientes() {
    try {
      const resposta = await api.get('/ambientes')

      const ambientesDoProjeto = resposta.data.filter(
        (ambiente) =>
          Number(ambiente.projeto?.id || ambiente.projetoId) ===
          Number(projetoId)
      )

      setAmbientes(ambientesDoProjeto)
    } catch (error) {
      console.error('Erro ao carregar ambientes:', error)
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  function selecionarDocumento(event) {
    const arquivo = event.target.files[0]

    if (!arquivo) {
      setDocumento(null)
      return
    }

    if (
      arquivo.type !== 'application/pdf' &&
      !arquivo.name.toLowerCase().endsWith('.pdf')
    ) {
      alert('Selecione somente arquivos PDF.')
      event.target.value = ''
      setDocumento(null)
      return
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      alert('O arquivo PDF não pode ultrapassar 5 MB.')
      event.target.value = ''
      setDocumento(null)
      return
    }

    setDocumento(arquivo)
  }

  function novoAmbiente() {
    setMenuAberto(null)
    setAmbienteEditando(null)
    setDocumento(null)

    setFormulario({
      nome: '',
      descricao: ''
    })

    setMostrarFormulario(true)
  }

  function editarAmbiente(ambiente) {
    setMenuAberto(null)
    setAmbienteEditando(ambiente)
    setDocumento(null)

    setFormulario({
      nome: ambiente.nome || '',
      descricao: ambiente.descricao || ''
    })

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setAmbienteEditando(null)
    setDocumento(null)

    setFormulario({
      nome: '',
      descricao: ''
    })
  }

  async function salvarAmbiente(event) {
    event.preventDefault()

    try {
      const dados = {
        nome: formulario.nome,
        descricao: formulario.descricao,
        projetoId: Number(projetoId)
      }

      const formData = new FormData()

      formData.append(
        'dados',
        new Blob([JSON.stringify(dados)], {
          type: 'application/json'
        })
      )

      if (documento) {
        formData.append('documento', documento)
      }

      if (ambienteEditando) {
        await api.put(
          `/ambientes/${ambienteEditando.id}`,
          formData
        )

        alert('Ambiente atualizado com sucesso!')
      } else {
        await api.post('/ambientes', formData)

        alert('Ambiente cadastrado com sucesso!')
      }

      cancelarFormulario()
      await carregarAmbientes()
    } catch (error) {
      console.error('Erro ao salvar ambiente:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar ambiente.'

      alert(mensagem)
    }
  }

  async function visualizarDocumento(ambienteId) {
    const novaAba = window.open('', '_blank')

    if (!novaAba) {
      alert('Permita pop-ups no navegador para visualizar o documento.')
      return
    }

    try {
      novaAba.document.write('Carregando documento...')

      const resposta = await api.get(
        `/ambientes/${ambienteId}/documento`,
        { responseType: 'blob' }
      )

      const arquivoUrl = URL.createObjectURL(resposta.data)
      novaAba.location.href = arquivoUrl

      setTimeout(() => {
        URL.revokeObjectURL(arquivoUrl)
      }, 60000)
    } catch (error) {
      console.error('Erro ao visualizar documento:', error)
      novaAba.close()

      alert(
        error.response?.data?.message ||
        'Não foi possível abrir o documento.'
      )
    }
  }

  async function excluirAmbiente(id) {
    setMenuAberto(null)

    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este ambiente?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/ambientes/${id}`)

      alert('Ambiente excluído com sucesso!')
      await carregarAmbientes()
    } catch (error) {
      console.error('Erro ao excluir ambiente:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir ambiente.'

      alert(mensagem)
    }
  }

  function alternarMenu(id) {
    setMenuAberto((atual) => atual === id ? null : id)
  }

  const ambientesFiltrados = ambientes.filter((ambiente) => {
    const termo = pesquisa.toLowerCase().trim()

    return (
      ambiente.nome?.toLowerCase().includes(termo) ||
      ambiente.descricao?.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="ambientes">

      {mostrarFormulario ? (
        <div className="ambiente-formulario-tela">
          <div className="ambiente-formulario-conteudo">

            <div className="ambiente-formulario-topo">
              <div>
                <span className="ambiente-formulario-identificacao">
                  PROJETO: {nomeProjeto || '...'}
                </span>

                <h1>
                  {ambienteEditando
                    ? 'Editar ambiente'
                    : 'Novo ambiente'}
                </h1>

                <p>
                  {ambienteEditando
                    ? 'Altere as informações do ambiente.'
                    : 'Preencha as informações para cadastrar um ambiente.'}
                </p>
              </div>

              <button
                type="button"
                className="ambiente-fechar-formulario"
                onClick={cancelarFormulario}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <form
              className="ambiente-formulario ambiente-formulario-full"
              onSubmit={salvarAmbiente}
            >
              <div>
                <label htmlFor="nomeAmbiente">
                  Nome do ambiente
                </label>

                <input
                  id="nomeAmbiente"
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={alterarCampo}
                  placeholder="Ex.: Cozinha"
                  required
                />
              </div>

              <div className="campo-descricao">
                <label htmlFor="descricaoAmbiente">
                  Descrição
                </label>

                <textarea
                  id="descricaoAmbiente"
                  name="descricao"
                  value={formulario.descricao}
                  onChange={alterarCampo}
                  placeholder="Descrição do ambiente"
                  rows="5"
                />
              </div>

              <div className="campo-documento">
                <label htmlFor="documentoAmbiente">
                  Documento do ambiente (PDF)
                </label>

                <input
                  id="documentoAmbiente"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={selecionarDocumento}
                />

                <small>Arquivo PDF de até 5 MB.</small>

                {documento && (
                  <p className="documento-selecionado">
                    Novo arquivo: {documento.name}
                  </p>
                )}

                {ambienteEditando?.nomeDocumento && (
                  <div className="documento-atual">
                    <span>
                      Documento atual: {ambienteEditando.nomeDocumento}
                    </span>

                    <button
                      type="button"
                      className="botao-visualizar-documento"
                      onClick={() =>
                        visualizarDocumento(ambienteEditando.id)
                      }
                    >
                      Visualizar PDF
                    </button>

                    <small>
                      Se não selecionar outro arquivo, o documento atual será mantido.
                    </small>
                  </div>
                )}
              </div>

              <div className="formulario-botoes">
                <button
                  type="button"
                  onClick={cancelarFormulario}
                >
                  Cancelar
                </button>

                <button type="submit">
                  {ambienteEditando
                    ? 'Salvar alterações'
                    : 'Cadastrar ambiente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="ambientes-header">
            <div>
              <h1>Ambientes</h1>
              <p>
                Ambientes cadastrados no projeto{' '}
                {nomeProjeto || '...'}
              </p>
            </div>

            <div className="ambientes-header-botoes">
              <button
                className="botao-voltar"
                onClick={() => navigate('/projetos')}
              >
                Voltar
              </button>

              <button
                className="botao-novo"
                onClick={novoAmbiente}
              >
                + Novo ambiente
              </button>
            </div>
          </div>

          <div className="ambientes-tabela">
            <div className="ambientes-tabela-header">
              <div>
                <h2>Ambientes cadastrados</h2>
                <span>
                  {ambientesFiltrados.length}{' '}
                  {ambientesFiltrados.length === 1
                    ? 'ambiente encontrado'
                    : 'ambientes encontrados'}
                </span>
              </div>

              <div className="ambientes-pesquisa">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou descrição..."
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                />
              </div>
            </div>

            {ambientesFiltrados.length === 0 ? (
              <div className="ambientes-vazio">
                <h3>
                  {ambientes.length === 0
                    ? 'Nenhum ambiente cadastrado'
                    : 'Nenhum ambiente encontrado'}
                </h3>

                <p>
                  {ambientes.length === 0
                    ? 'Cadastre um novo ambiente para começar.'
                    : 'Tente pesquisar por outro nome ou descrição.'}
                </p>
              </div>
            ) : (
              <div className="tabela-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Descrição</th>
                      <th>Orçamento</th>
                      <th>Documento</th>
                      <th className="coluna-acoes-ambiente"> </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ambientesFiltrados.map((ambiente) => (
                    <tr
                          key={ambiente.id}
                          className="ambiente-linha"
                        >
                        <td>{ambiente.nome}</td>

                        <td>{ambiente.descricao || '-'}</td>

                        <td>
                          <button
                            className="botao-abrir"
                            onClick={() =>
                              navigate(`/ambientes/${ambiente.id}/orcamentos`)
                            }
                          >
                            Acessar orçamento
                          </button>
                        </td>

                        <td>
                          {ambiente.nomeDocumento ? (
                            <button
                              className="botao-anexo"
                              onClick={() =>
                                visualizarDocumento(ambiente.id)
                              }
                              type="button"
                            >
                              Ver anexo
                            </button>
                          ) : (
                            <span className="sem-anexo">
                              Sem anexo
                            </span>
                          )}
                        </td>

                        <td className="coluna-acoes-ambiente">
                          <div className="menu-acoes-ambiente">
                            <button
                              type="button"
                              className="botao-tres-pontos"
                              aria-label={`Mais opções para ${ambiente.nome}`}
                              aria-expanded={menuAberto === ambiente.id}
                              onClick={() => alternarMenu(ambiente.id)}
                            >
                              ⋮
                            </button>

                            {menuAberto === ambiente.id && (
                              <div className="menu-dropdown-ambiente">
                                <button
                                  type="button"
                                  onClick={() => editarAmbiente(ambiente)}
                                >
                                  <span>✎</span>
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="opcao-excluir-ambiente"
                                  onClick={() => excluirAmbiente(ambiente.id)}
                                >
                                  <span>🗑️</span>
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Ambientes
