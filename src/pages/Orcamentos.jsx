import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import './Orcamentos.css'

function Orcamentos() {
  const { ambienteId } = useParams()
  const navigate = useNavigate()

  const [orcamentos, setOrcamentos] = useState([])
  const [materiais, setMateriais] = useState([])
  const [itensMateriais, setItensMateriais] = useState([])

  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarMaterial, setMostrarMaterial] = useState(false)

  const [orcamentoEditando, setOrcamentoEditando] = useState(null)

 const [formulario, setFormulario] = useState({
  valorMaoObra: '',
  margemLucro: '',
  descricao: '',
  status: 'PENDENTE'
})

  const [materialFormulario, setMaterialFormulario] = useState({
    materialId: '',
    quantidade: '',
    unidade: 'un',
    valorUnitario: ''
  })

  useEffect(() => {
    carregarOrcamentos()
  }, [ambienteId])

  async function carregarOrcamentos() {
    try {
      const resposta = await api.get('/orcamentos')

      let lista = resposta.data

      if (ambienteId) {
        lista = lista.filter(
          (orcamento) =>
            Number(orcamento.ambienteId) === Number(ambienteId)
        )
      }

      setOrcamentos(lista)
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
    }
  }

  async function carregarMateriais() {
    try {
      const resposta = await api.get('/materiais')
      console.log('Dados dos materiais:', resposta.data)
      setMateriais(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar materiais:', error)
      alert('Erro ao carregar materiais.')
    }
  }

async function abrirOrcamento(orcamento) {
  setMostrarMaterial(false)

  try {
    const respostaOrcamento = await api.get(
      `/orcamentos/${orcamento.id}`
    )

    setOrcamentoSelecionado(respostaOrcamento.data)

    const respostaMateriais = await api.get(
      `/orcamentos/${orcamento.id}/materiais`
    )

    setItensMateriais(respostaMateriais.data)
  } catch (error) {
    console.error(
      'Erro ao carregar orçamento:',
      error
    )

    setOrcamentoSelecionado(orcamento)
    setItensMateriais([])
  }
}

  function fecharOrcamento() {
    setOrcamentoSelecionado(null)
    setItensMateriais([])
    setMostrarMaterial(false)
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function novoOrcamento() {
    setOrcamentoEditando(null)

  setFormulario({
  valorMaoObra: '',
  margemLucro: '',
  descricao: '',
  status: 'PENDENTE'
})

    setMostrarFormulario(true)
  }

  function editarOrcamento(orcamento) {
    setOrcamentoEditando(orcamento)

 setFormulario({
  valorMaoObra: orcamento.valorMaoObra || '',
  margemLucro: orcamento.margemLucro || '',
  descricao: orcamento.descricao || '',
  status: orcamento.status || 'PENDENTE'
})

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setOrcamentoEditando(null)

setFormulario({
  valorMaoObra: '',
  margemLucro: '',
  descricao: '',
  status: 'PENDENTE'
})
  }

  async function salvarOrcamento(event) {
    event.preventDefault()

    try {
            const dados = {
          valorMaoObra: Number(formulario.valorMaoObra),
          margemLucro: Number(formulario.margemLucro),
          descricao: formulario.descricao,
          status: formulario.status,
          ambienteId: Number(ambienteId)
        }

      if (orcamentoEditando) {
        await api.put(
          `/orcamentos/${orcamentoEditando.id}`,
          dados
        )

        alert('Orçamento atualizado com sucesso!')
      } else {
        await api.post('/orcamentos', dados)

        alert('Orçamento cadastrado com sucesso!')
      }

      cancelarFormulario()
      carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar orçamento.'

      alert(mensagem)
    }
  }

  async function aprovarOrcamento(orcamento) {
  const confirmar = window.confirm(
    'Deseja aprovar este orçamento?'
  )

  if (!confirmar) {
    return
  }

  try {
    const dados = {
      valorMaoObra: Number(orcamento.valorMaoObra || 0),
      margemLucro: Number(orcamento.margemLucro || 0),
      descricao: orcamento.descricao || '',
      status: 'APROVADO',
      ambienteId: Number(orcamento.ambienteId)
    }

    await api.put(
      `/orcamentos/${orcamento.id}`,
      dados
    )

    alert('Orçamento aprovado com sucesso!')

    await carregarOrcamentos()

    if (
      orcamentoSelecionado &&
      Number(orcamentoSelecionado.id) === Number(orcamento.id)
    ) {
      const resposta = await api.get(
        `/orcamentos/${orcamento.id}`
      )

      setOrcamentoSelecionado(resposta.data)
    }

  } catch (error) {
    console.error(
      'Erro ao aprovar orçamento:',
      error
    )

    const mensagem =
      error.response?.data?.message ||
      'Erro ao aprovar orçamento.'

    alert(mensagem)
  }
}

  async function excluirOrcamento(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este orçamento?'
    )

    if (!confirmar) {
      return
    }

    try {
      await api.delete(`/orcamentos/${id}`)

      alert('Orçamento excluído com sucesso!')

      if (
        orcamentoSelecionado &&
        Number(orcamentoSelecionado.id) === Number(id)
      ) {
        fecharOrcamento()
      }

      carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao excluir orçamento.'

      alert(mensagem)
    }
  }

  function abrirAdicionarMaterial() {
    carregarMateriais()

    setMaterialFormulario({
      materialId: '',
      quantidade: '',
      unidade: 'un',
      valorUnitario: ''
    })

    setMostrarMaterial(true)
  }

  function selecionarMaterial(event) {
    const materialId = event.target.value

    const material = materiais.find(
      (item) => Number(item.id) === Number(materialId)
    )

    setMaterialFormulario({
      ...materialFormulario,
      materialId,
      valorUnitario: material
        ? material.valorUnitario
        : ''
    })
  }

  function alterarMaterialCampo(event) {
    const { name, value } = event.target

    setMaterialFormulario({
      ...materialFormulario,
      [name]: value
    })
  }

  async function adicionarMaterial(event) {
    event.preventDefault()

    if (!orcamentoSelecionado) {
      return
    }

    try {
      const dados = {
        quantidade: Number(materialFormulario.quantidade),
        unidade: materialFormulario.unidade,
        valorUnitario: Number(
          materialFormulario.valorUnitario
        ),
        materialId: Number(
          materialFormulario.materialId
        )
      }

      await api.post(
        `/orcamentos/${orcamentoSelecionado.id}/materiais`,
        dados
      )

      alert('Material adicionado ao orçamento!')

      setMostrarMaterial(false)

        const resposta = await api.get(
          `/orcamentos/${orcamentoSelecionado.id}/materiais`
        )

        setItensMateriais(resposta.data)

        const respostaOrcamento = await api.get(
          `/orcamentos/${orcamentoSelecionado.id}`
        )

setOrcamentoSelecionado(respostaOrcamento.data)
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

  async function excluirMaterial(id) {
    const confirmar = window.confirm(
      'Deseja remover este material do orçamento?'
    )

    if (!confirmar) {
      return
    }

    try {
      await api.delete(
        `/orcamentos/materiais/${id}`
      )

      const resposta = await api.get(
        `/orcamentos/${orcamentoSelecionado.id}/materiais`
      )

      setItensMateriais(resposta.data)

      const respostaOrcamento = await api.get(
        `/orcamentos/${orcamentoSelecionado.id}`
      )

      setOrcamentoSelecionado(respostaOrcamento.data)

      alert('Material removido do orçamento!')
    } catch (error) {
      console.error(
        'Erro ao remover material:',
        error
      )

      const mensagem =
        error.response?.data?.message ||
        'Erro ao remover material.'

      alert(mensagem)
    }
  }

  function calcularTotalMateriais() {
    return itensMateriais.reduce(
      (total, item) =>
        total + Number(item.subtotal || 0),
      0
    )
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    )
  }

  function formatarData(data) {
    if (!data) {
      return '-'
    }

    return new Date(data).toLocaleDateString(
      'pt-BR'
    )
  }

  function traduzirStatus(status) {
    const statusMap = {
      PENDENTE: 'Pendente',
      APROVADO: 'Aprovado',
      RECUSADO: 'Recusado'
    }

    return statusMap[status] || status
  }

  function classeStatus(status) {
    if (status === 'APROVADO') {
      return 'status-aprovado'
    }

    if (status === 'RECUSADO') {
      return 'status-recusado'
    }

    return 'status-pendente'
  }

  /*
   * ==================================================
   * TELA DE DETALHES DO ORÇAMENTO
   * ==================================================
   */

  if (orcamentoSelecionado) {
    const totalMateriais = calcularTotalMateriais()

    return (
      <div className="orcamentos">

        <div className="orcamento-detalhes-header">

          <div>
            <button
              className="botao-voltar"
              onClick={fecharOrcamento}
            >
              ← Voltar
            </button>

            <h1>Orçamento</h1>

            <p>
              {orcamentoSelecionado.projetoNome}
              {' - '}
              {orcamentoSelecionado.ambienteNome}
            </p>
          </div>

          <span
            className={`status ${classeStatus(
              orcamentoSelecionado.status
            )}`}
          >
            {traduzirStatus(
              orcamentoSelecionado.status
            )}
          </span>

        </div>

        <div className="orcamento-resumo">

          <div className="resumo-card">
            <span>Projeto</span>
            <strong>
              {orcamentoSelecionado.projetoNome || '-'}
            </strong>
          </div>

          <div className="resumo-card">
            <span>Ambiente</span>
            <strong>
              {orcamentoSelecionado.ambienteNome || '-'}
            </strong>
          </div>

          <div className="resumo-card">
            <span>Data de criação</span>
            <strong>
              {formatarData(
                orcamentoSelecionado.dataCriacao
              )}
            </strong>
          </div>

          <div className="resumo-card">
            <span>Validade</span>
            <strong>
              {formatarData(
                orcamentoSelecionado.dataValidade
              )}
            </strong>
          </div>

        </div>

        <div className="orcamento-informacoes">

          <div>
            <span>Descrição</span>

            <p>
              {orcamentoSelecionado.descricao ||
                'Nenhuma descrição informada.'}
            </p>
          </div>

        </div>

        <div className="materiais-orcamento">

          <div className="materiais-header">

            <div>
              <h2>Materiais</h2>

              <p>
                Materiais utilizados neste orçamento
              </p>
            </div>

            <button
              className="botao-novo"
              onClick={abrirAdicionarMaterial}
            >
              + Adicionar material
            </button>

          </div>

          {mostrarMaterial && (

            <div className="material-formulario">

              <h3>Adicionar material</h3>

              <form onSubmit={adicionarMaterial}>

                <div>
                  <label>Material</label>

                  <select
                    name="materialId"
                    value={
                      materialFormulario.materialId
                    }
                    onChange={selecionarMaterial}
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
                        {material.nome} — Estoque: {material.quantidade ?? 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Quantidade</label>

                  <input
                    type="number"
                    name="quantidade"
                    value={
                      materialFormulario.quantidade
                    }
                    onChange={alterarMaterialCampo}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label>Unidade</label>

                  <select
                    name="unidade"
                    value={
                      materialFormulario.unidade
                    }
                    onChange={alterarMaterialCampo}
                  >
                    <option value="un">
                      Unidade
                    </option>

                    <option value="m">
                      Metro
                    </option>

                    <option value="m²">
                      m²
                    </option>

                    <option value="m³">
                      m³
                    </option>

                    <option value="kg">
                      Kg
                    </option>

                    <option value="L">
                      Litro
                    </option>
                  </select>
                </div>

                <div>
                  <label>Valor unitário</label>

                  <input
                    type="number"
                    name="valorUnitario"
                    value={
                      materialFormulario.valorUnitario
                    }
                    onChange={alterarMaterialCampo}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="material-form-botoes">

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarMaterial(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button type="submit">
                    Adicionar
                  </button>

                </div>

              </form>

            </div>

          )}

          <div className="materiais-tabela">

            <table>

              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Unidade</th>
                  <th>Valor unitário</th>
                  <th>Subtotal</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {itensMateriais.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="tabela-vazia"
                    >
                      Nenhum material adicionado
                      ao orçamento.
                    </td>
                  </tr>

                ) : (

                  itensMateriais.map((item) => (

                    <tr key={item.id}>

                      <td>
                        {item.materialNome}
                      </td>

                      <td>
                        {item.quantidade}
                      </td>

                      <td>
                        {item.unidade || '-'}
                      </td>

                      <td>
                        {formatarValor(
                          item.valorUnitario
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatarValor(
                            item.subtotal
                          )}
                        </strong>
                      </td>

                      <td>

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            excluirMaterial(
                              item.id
                            )
                          }
                        >
                          Remover
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

          <div className="totais-orcamento">

            <div className="total-linha">
              <span>Total dos materiais</span>

              <strong>
                {formatarValor(totalMateriais)}
              </strong>
            </div>

            <div className="total-linha">
  <span>Mão de obra</span>

  <strong>
    {formatarValor(
      orcamentoSelecionado.valorMaoObra
    )}
  </strong>
</div>

<div className="total-linha">
  <span>Margem de lucro</span>

  <strong>
    {Number(
      orcamentoSelecionado.margemLucro || 0
    ).toFixed(2)}%
  </strong>
</div>

            <div className="total-final">
              <span>Valor final do orçamento</span>

              <strong>
                {formatarValor(
                  orcamentoSelecionado.valor
                )}
              </strong>
            </div>

          </div>

        </div>

      </div>
    )
  }

  /*
   * ==================================================
   * LISTA DE ORÇAMENTOS
   * ==================================================
   */

  return (
    <div className="orcamentos">

      <div className="orcamentos-header">

        <div>
          <h1>Orçamentos</h1>

          <p>
            {ambienteId
              ? 'Orçamentos deste ambiente'
              : 'Todos os orçamentos cadastrados'}
          </p>
        </div>

        <div className="orcamentos-header-botoes">

          {ambienteId && (
            <button
              className="botao-voltar"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
          )}

          {ambienteId && (
            <button
              className="botao-novo"
              onClick={novoOrcamento}
            >
              + Novo orçamento
            </button>
          )}

        </div>

      </div>

      {mostrarFormulario && ambienteId && (

        <div className="orcamento-formulario">

          <h2>
            {orcamentoEditando
              ? 'Editar orçamento'
              : 'Novo orçamento'}
          </h2>

          <form onSubmit={salvarOrcamento}>

              <div>
                <label>Valor final</label>

                <input
                  type="text"
                  value="Calculado automaticamente"
                  disabled
                />
              </div>


              <div>
  <label>Mão de obra</label>

  <input
    type="number"
    name="valorMaoObra"
    value={formulario.valorMaoObra}
    onChange={alterarCampo}
    placeholder="Ex.: 2500.00"
    min="0"
    step="0.01"
  />
</div>

<div>
  <label>Margem de lucro (%)</label>

  <input
    type="number"
    name="margemLucro"
    value={formulario.margemLucro}
    onChange={alterarCampo}
    placeholder="Ex.: 30"
    min="0"
    step="0.01"
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
                <option value="PENDENTE">
                  Pendente
                </option>

                <option value="APROVADO">
                  Aprovado
                </option>

                <option value="RECUSADO">
                  Recusado
                </option>
              </select>
            </div>

            <div className="campo-descricao">

              <label>Descrição</label>

              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                placeholder="Descrição do orçamento"
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
                {orcamentoEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
              </button>

            </div>

          </form>

        </div>

      )}

      <div className="orcamentos-tabela">

        <table>

          <thead>

            <tr>
              <th>Projeto</th>
              <th>Ambiente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Criação</th>
              <th>Validade</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>

          </thead>

          <tbody>

            {orcamentos.length === 0 ? (

              <tr>
                <td
                  colSpan="8"
                  className="tabela-vazia"
                >
                  Nenhum orçamento cadastrado.
                </td>
              </tr>

            ) : (

              orcamentos.map((orcamento) => (

                <tr key={orcamento.id}>

                  <td>
                    {orcamento.projetoNome || '-'}
                  </td>

                  <td>
                    {orcamento.ambienteNome || '-'}
                  </td>

                  <td>
                    {formatarValor(
                      orcamento.valor
                    )}
                  </td>

                  <td>

                    <span
                      className={`status ${classeStatus(
                        orcamento.status
                      )}`}
                    >
                      {traduzirStatus(
                        orcamento.status
                      )}
                    </span>

                  </td>

                  <td>
                    {formatarData(
                      orcamento.dataCriacao
                    )}
                  </td>

                  <td>
                    {formatarData(
                      orcamento.dataValidade
                    )}
                  </td>

                  <td>
                    {orcamento.descricao || '-'}
                  </td>

                  <td>

                    <div className="acoes">

                      <button
                        className="botao-abrir"
                        onClick={() =>
                          abrirOrcamento(
                            orcamento
                          )
                        }
                      >
                        Abrir
                      </button>

                      <button
                        className="botao-editar"
                        onClick={() =>
                          editarOrcamento(
                            orcamento
                          )
                        }
                      >
                        Editar
                      </button>

                              {orcamento.status === 'PENDENTE' && (
                              <button
                                className="botao-aprovar"
                                onClick={() => aprovarOrcamento(orcamento)}
                              >
                                Aprovar
                              </button>
                            )}

                      <button
                        className="botao-excluir"
                        onClick={() =>
                          excluirOrcamento(
                            orcamento.id
                          )
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

    </div>
  )
}

export default Orcamentos