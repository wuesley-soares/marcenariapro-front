import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import './Ambientes.css'


function Ambientes() {
  const { projetoId } = useParams()
  const navigate = useNavigate()


  const [ambientes, setAmbientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ambienteEditando, setAmbienteEditando] = useState(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: ''
  })

  useEffect(() => {
    carregarAmbientes()
  }, [])

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

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function novoAmbiente() {
    setAmbienteEditando(null)

    setFormulario({
      nome: '',
      descricao: ''
    })

    setMostrarFormulario(true)
  }

  function editarAmbiente(ambiente) {
    setAmbienteEditando(ambiente)

    setFormulario({
      nome: ambiente.nome || '',
      descricao: ambiente.descricao || ''
    })

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setAmbienteEditando(null)

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

      if (ambienteEditando) {
        await api.put(`/ambientes/${ambienteEditando.id}`, dados)
        alert('Ambiente atualizado com sucesso!')
      } else {
        await api.post('/ambientes', dados)
        alert('Ambiente cadastrado com sucesso!')
      }

      cancelarFormulario()
      carregarAmbientes()
    } catch (error) {
      console.error('Erro ao salvar ambiente:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar ambiente.'

      alert(mensagem)
    }
  }

  async function excluirAmbiente(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este ambiente?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/ambientes/${id}`)

      alert('Ambiente excluído com sucesso!')

      carregarAmbientes()
    } catch (error) {
      console.error('Erro ao excluir ambiente:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir ambiente.'

      alert(mensagem)
    }
  }

  return (
    <div className="ambientes">

      <div className="ambientes-header">
        <div>
          <h1>Ambientes</h1>
          <p>Ambientes cadastrados neste projeto</p>
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
            Novo ambiente
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="ambiente-formulario">

          <h2>
            {ambienteEditando
              ? 'Editar ambiente'
              : 'Novo ambiente'}
          </h2>

          <form onSubmit={salvarAmbiente}>

            <div>
              <label>Nome do ambiente</label>

              <input
                type="text"
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                placeholder="Ex.: Cozinha"
                required
              />
            </div>

            <div className="campo-descricao">
              <label>Descrição</label>

              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                placeholder="Descrição do ambiente"
                rows="4"
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
                {ambienteEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="ambientes-tabela">

        <table>

          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {ambientes.map((ambiente) => (
              <tr key={ambiente.id}>

                <td>{ambiente.nome}</td>

                <td>
                  {ambiente.descricao || '-'}
                </td>

                <td>
                  <div className="acoes">

                    <button
                      className="botao-editar"
                      onClick={() =>
                        editarAmbiente(ambiente)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() =>
                        excluirAmbiente(ambiente.id)
                      }
                    >
                      Excluir
                    </button>


                    <button
  className="botao-abrir"
  onClick={() =>
    navigate(`/ambientes/${ambiente.id}/orcamentos`)
  }
>
  Orçamento
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

export default Ambientes