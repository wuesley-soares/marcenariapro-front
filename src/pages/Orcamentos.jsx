
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from "lucide-react";
import api from '../services/api'
import './Orcamentos.css'


function Orcamentos() {
  const { ambienteId } = useParams()
  const navigate = useNavigate()

  const [orcamentos, setOrcamentos] = useState([])
  const [ambientes, setAmbientes] = useState([])
  const [materiais, setMateriais] = useState([])
  const [itensMateriais, setItensMateriais] = useState([])

  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarMaterial, setMostrarMaterial] = useState(false)
  const [menuAberto, setMenuAberto] = useState(null)

  function alternarMenu(id) {
    setMenuAberto((atual) => atual === id ? null : id)
  }

  const [ambienteSelecionado, setAmbienteSelecionado] = useState(
    ambienteId || ''
  )

  const [pesquisa, setPesquisa] = useState('')

  const [formulario, setFormulario] = useState({
    valorMaoObra: '',
    margemLucro: '',
    descricao: ''
  })

  const [materialFormulario, setMaterialFormulario] = useState({
    materialId: '',
    quantidade: '',
    unidade: 'un',
    valorUnitario: ''
  })

  useEffect(() => {
    carregarOrcamentos()
    carregarAmbientes()
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

  async function carregarAmbientes() {
    try {
      const resposta = await api.get('/ambientes')
      setAmbientes(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar ambientes:', error)
      alert('Erro ao carregar ambientes.')
    }
  }

  async function carregarMateriais() {
    try {
      const resposta = await api.get('/materiais')
      setMateriais(resposta.data)
    } catch (error) {
      console.error('Erro ao carregar materiais:', error)
      alert('Erro ao carregar materiais.')
    }
  }

async function carregarDetalhes(id, dadosIniciais = null) {
  try {
    const respostaOrcamento = await api.get(`/orcamentos/${id}`)
    const orcamento = respostaOrcamento.data

    setOrcamentoSelecionado(orcamento)

    await carregarMateriais()

    setFormulario({
      valorMaoObra: orcamento.valorMaoObra ?? '',
      margemLucro: orcamento.margemLucro ?? '',
      descricao: orcamento.descricao || ''
    })

    setAmbienteSelecionado(String(orcamento.ambienteId || ''))
    setMostrarFormulario(true)

    try {
      const respostaMateriais = await api.get(
        `/orcamentos/${id}/materiais`
      )

      setItensMateriais(respostaMateriais.data)
    } catch (error) {
      console.error('Erro ao carregar materiais:', error)
      setItensMateriais([])
      alert('Não foi possível carregar os materiais.')
    }

  } catch (error) {
    console.error('Erro ao carregar orçamento:', error)

    if (dadosIniciais) {
      setOrcamentoSelecionado(dadosIniciais)

      setFormulario({
        valorMaoObra: dadosIniciais.valorMaoObra ?? '',
        margemLucro: dadosIniciais.margemLucro ?? '',
        descricao: dadosIniciais.descricao || ''
      })

      setAmbienteSelecionado(
        String(dadosIniciais.ambienteId || '')
      )

      setItensMateriais([])
      setMostrarFormulario(true)
    } else {
      alert('Erro ao carregar os dados do orçamento.')
    }
  }
}

async function alterarStatusOrcamento(orcamento, novoStatus) {
  const acao = novoStatus === 'APROVADO' ? 'aprovar' : 'cancelar'

  const confirmar = window.confirm(
    `Deseja realmente ${acao} este orçamento?`
  )

  if (!confirmar) return

  try {
    const dados = {
      valorMaoObra: Number(orcamento.valorMaoObra || 0),
      margemLucro: Number(orcamento.margemLucro || 0),
      descricao: orcamento.descricao || '',
      status: novoStatus,
      ambienteId: Number(orcamento.ambienteId)
    }

    await api.put(`/orcamentos/${orcamento.id}`, dados)

    alert(
      novoStatus === 'APROVADO'
        ? 'Orçamento aprovado com sucesso!'
        : 'Orçamento cancelado com sucesso!'
    )

    await carregarOrcamentos()

  } catch (error) {
    console.error('Erro ao alterar status:', error)

    alert(
      error.response?.data?.message ||
      'Erro ao alterar o status do orçamento.'
    )
  }
}

  function novoOrcamento() {
    setOrcamentoSelecionado(null)
    setItensMateriais([])
    setMostrarMaterial(false)

    setFormulario({
      valorMaoObra: '',
      margemLucro: '',
      descricao: ''
    })

    setAmbienteSelecionado(ambienteId || '')
    setMostrarFormulario(true)
  }

  function abrirOrcamento(orcamento) {
    setMostrarMaterial(false)
    carregarDetalhes(orcamento.id, orcamento)
  }

  function fecharFormulario() {
    setMostrarFormulario(false)
    setOrcamentoSelecionado(null)
    setItensMateriais([])
    setMostrarMaterial(false)

    setFormulario({
      valorMaoObra: '',
      margemLucro: '',
      descricao: ''
    })

    carregarOrcamentos()
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  async function salvarOrcamento(event) {
    event.preventDefault()

    if (!orcamentoSelecionado && !ambienteSelecionado) {
      alert('Selecione um ambiente para o orçamento.')
      return
    }

    try {
      const dados = {
        valorMaoObra: Number(formulario.valorMaoObra || 0),
        margemLucro: Number(formulario.margemLucro || 0),
        descricao: formulario.descricao,
        status: orcamentoSelecionado
          ? orcamentoSelecionado.status
          : 'PENDENTE',
        ambienteId: Number(
          orcamentoSelecionado
            ? orcamentoSelecionado.ambienteId
            : ambienteSelecionado
        )
      }

      if (orcamentoSelecionado) {
        await api.put(
          `/orcamentos/${orcamentoSelecionado.id}`,
          dados
        )

        alert('Orçamento atualizado com sucesso!')

        await carregarDetalhes(orcamentoSelecionado.id)
      } else {
        const resposta = await api.post('/orcamentos', dados)

        alert(
          'Orçamento cadastrado! Agora você pode adicionar os materiais.'
        )

        await carregarDetalhes(resposta.data.id, resposta.data)
      }

      await carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)

      const mensagem =
        error.response?.data?.message ||
        'Erro ao salvar orçamento.'

      alert(mensagem)
    }
  }

  async function aprovarOrcamento() {
    if (!orcamentoSelecionado) return

    const confirmar = window.confirm(
      'Deseja aprovar este orçamento?'
    )

    if (!confirmar) return

    try {
      const dados = {
        valorMaoObra: Number(orcamentoSelecionado.valorMaoObra || 0),
        margemLucro: Number(orcamentoSelecionado.margemLucro || 0),
        descricao: orcamentoSelecionado.descricao || '',
        status: 'APROVADO',
        ambienteId: Number(orcamentoSelecionado.ambienteId)
      }

      await api.put(
        `/orcamentos/${orcamentoSelecionado.id}`,
        dados
      )

      alert('Orçamento aprovado com sucesso!')

      await carregarDetalhes(orcamentoSelecionado.id)
      await carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error)

      alert(
        error.response?.data?.message ||
        'Erro ao aprovar orçamento.'
      )
    }
  }

  async function excluirOrcamento(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este orçamento?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/orcamentos/${id}`)

      alert('Orçamento excluído com sucesso!')

      await carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)

      alert(
        error.response?.data?.message ||
        'Erro ao excluir orçamento.'
      )
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

    setMaterialFormulario((anterior) => ({
      ...anterior,
      materialId,
      valorUnitario: material
        ? material.valorUnitario
        : ''
    }))
  }

  function alterarMaterialCampo(event) {
    const { name, value } = event.target

    setMaterialFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  async function adicionarMaterial(event) {
    event.preventDefault()

    if (!orcamentoSelecionado) return

    try {
      const dados = {
        quantidade: Number(materialFormulario.quantidade),
        unidade: materialFormulario.unidade,
        valorUnitario: Number(materialFormulario.valorUnitario),
        materialId: Number(materialFormulario.materialId)
      }

      await api.post(
        `/orcamentos/${orcamentoSelecionado.id}/materiais`,
        dados
      )

      alert('Material adicionado ao orçamento!')

      setMostrarMaterial(false)

      await carregarDetalhes(orcamentoSelecionado.id)
      await carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao adicionar material:', error)

      alert(
        error.response?.data?.message ||
        'Erro ao adicionar material.'
      )
    }
  }

  async function excluirMaterial(id) {
    const confirmar = window.confirm(
      'Deseja remover este material do orçamento?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/orcamentos/materiais/${id}`)

      await carregarDetalhes(orcamentoSelecionado.id)
      await carregarOrcamentos()

      alert('Material removido do orçamento!')
    } catch (error) {
      console.error('Erro ao remover material:', error)

      alert(
        error.response?.data?.message ||
        'Erro ao remover material.'
      )
    }
  }

  function calcularTotalMateriais() {
    return itensMateriais.reduce(
      (total, item) => total + Number(item.subtotal || 0),
      0
    )
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function formatarData(data) {
    if (!data) return '-'

    return new Date(data).toLocaleDateString('pt-BR')
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
    if (status === 'APROVADO') return 'status-aprovado'
    if (status === 'RECUSADO') return 'status-recusado'

    return 'status-pendente'
  }

  function calcularFaltaEstoque() {
  const material = materiais.find(
    (item) => Number(item.id) === Number(materialFormulario.materialId)
  )



  if (!material || !materialFormulario.quantidade) {
    return 0
  }

  const quantidadeNecessaria = Number(materialFormulario.quantidade)
  const quantidadeDisponivel = Number(material.quantidade || 0)

  return Math.max(0, quantidadeNecessaria - quantidadeDisponivel)
}

function calcularFaltaItemOrcamento(item) {
  const material = materiais.find(
    (m) => Number(m.id) === Number(item.materialId)
  )

  if (!material) return 0

  const quantidadeTotal = itensMateriais
    .filter(
      (outroItem) =>
        Number(outroItem.materialId) === Number(item.materialId)
    )
    .reduce(
      (total, outroItem) => total + Number(outroItem.quantidade || 0),
      0
    )

  return Math.max(
    0,
    quantidadeTotal - Number(material.quantidade || 0)
  )
}

function obterMaterialSelecionado() {
  return materiais.find(
    (item) => Number(item.id) === Number(materialFormulario.materialId)
  )
}

  const ambientesDisponiveis = ambientes.filter((ambiente) => {
    const jaPossuiOrcamento = orcamentos.some(
      (orcamento) =>
        Number(orcamento.ambienteId) === Number(ambiente.id)
    )

    if (jaPossuiOrcamento) return false

    if (ambienteId) {
      return Number(ambiente.id) === Number(ambienteId)
    }

    return true
  })

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const termo = pesquisa.toLowerCase().trim()

    return (
      orcamento.projetoNome?.toLowerCase().includes(termo) ||
      orcamento.ambienteNome?.toLowerCase().includes(termo) ||
      orcamento.descricao?.toLowerCase().includes(termo) ||
      traduzirStatus(orcamento.status)?.toLowerCase().includes(termo) ||
      String(orcamento.valor ?? '').includes(termo) ||
      formatarValor(orcamento.valor).toLowerCase().includes(termo)
    )
  })

  /*
   * TELA UNIFICADA DE CRIAÇÃO E EDIÇÃO
   */

  if (mostrarFormulario) {
    const totalMateriais = calcularTotalMateriais()

    return (
      <div className="orcamentos tela-orcamento-aberta">

        <div className="orcamento-detalhes-header">
          <div>
            <button
              className="botao-voltar"
              onClick={fecharFormulario}
            >
              ← Voltar
            </button>

            <h1>
              {orcamentoSelecionado
                ? 'Editar orçamento'
                : 'Novo orçamento'}
            </h1>

            <p>
              {orcamentoSelecionado
                ? `${orcamentoSelecionado.projetoNome || ''} - ${orcamentoSelecionado.ambienteNome || ''}`
                : 'Preencha os dados para cadastrar um orçamento.'}
            </p>
          </div>

          {orcamentoSelecionado && (
            <span
              className={`status ${classeStatus(orcamentoSelecionado.status)}`}
            >
              {traduzirStatus(orcamentoSelecionado.status)}
            </span>
          )}
        </div>

        <div className="orcamento-formulario">
          <h2>Dados do orçamento</h2>

          <form onSubmit={salvarOrcamento}>

            {!orcamentoSelecionado && !ambienteId && (
              <div>
                <label>Ambiente</label>

                <select
                  value={ambienteSelecionado}
                  onChange={(event) =>
                    setAmbienteSelecionado(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Selecione um ambiente
                  </option>

                  {ambientesDisponiveis.map((ambiente) => (
                    <option key={ambiente.id} value={ambiente.id}>
                      {ambiente.projeto?.nome || 'Projeto'} - {ambiente.nome}
                    </option>
                  ))}
                </select>

                {ambientesDisponiveis.length === 0 && (
                  <small>
                    Não existem ambientes disponíveis sem orçamento.
                  </small>
                )}
              </div>
            )}

            {!orcamentoSelecionado && ambienteId && (
              <div>
                <label>Ambiente</label>

                <input
                  type="text"
                  value={
                    ambientes.find(
                      (ambiente) =>
                        Number(ambiente.id) === Number(ambienteId)
                    )?.nome || 'Carregando ambiente...'
                  }
                  disabled
                />
              </div>
            )}

            {orcamentoSelecionado && (
              <div>
                <label>Ambiente</label>

                <input
                  type="text"
                  value={orcamentoSelecionado.ambienteNome || ''}
                  disabled
                />
              </div>
            )}

            <div>
              <label>Valor final</label>

              <input
                type="text"
                value={
                  orcamentoSelecionado
                    ? formatarValor(orcamentoSelecionado.valor)
                    : 'Calculado após adicionar materiais'
                }
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

            {!orcamentoSelecionado && (
              <div>
                <label>Status</label>

                <input
                  type="text"
                  value="Pendente"
                  disabled
                />
              </div>
            )}

            {orcamentoSelecionado && (
              <div>
                <label>Status atual</label>

                <input
                  type="text"
                  value={traduzirStatus(orcamentoSelecionado.status)}
                  disabled
                />
              </div>
            )}

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
                onClick={fecharFormulario}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  !orcamentoSelecionado &&
                  !ambienteSelecionado
                }
              >
                {orcamentoSelecionado
                  ? 'Salvar alterações'
                  : 'Cadastrar orçamento'}
              </button>
            </div>

          </form>
        </div>

        {orcamentoSelecionado && (
          <div className="materiais-orcamento">

            <div className="materiais-header">
              <div>
                <h2>Materiais</h2>
                <p>Materiais utilizados neste orçamento</p>
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
                      value={materialFormulario.materialId}
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

                    {obterMaterialSelecionado() && (
  <div className="material-estoque-info">
    <p>
      Estoque atual:{' '}
      <strong>
        {obterMaterialSelecionado().quantidade ?? 0}
      </strong>
    </p>

    {materialFormulario.quantidade !== '' && (
      calcularFaltaEstoque() > 0 ? (
        <p className="aviso-estoque-insuficiente">
          Será necessário comprar{' '}
          <strong>{calcularFaltaEstoque()}</strong>{' '}
          unidade(s) deste material.
        </p>
      ) : (
        <p className="aviso-estoque-suficiente">
          Há estoque suficiente para esta quantidade.
        </p>
      )
    )}
  </div>
)}
                  </div>

                  <div>
                    <label>Quantidade</label>

                    <input
                      type="number"
                      name="quantidade"
                      value={materialFormulario.quantidade}
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
                      value={materialFormulario.unidade}
                      onChange={alterarMaterialCampo}
                    >
                      <option value="un">Unidade</option>
                      <option value="m">Metro</option>
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="kg">Kg</option>
                      <option value="L">Litro</option>
                    </select>
                  </div>

                  <div>
                    <label>Valor unitário</label>

                    <input
                      type="number"
                      name="valorUnitario"
                      value={materialFormulario.valorUnitario}
                      onChange={alterarMaterialCampo}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="material-form-botoes">
                    <button
                      type="button"
                      onClick={() => setMostrarMaterial(false)}
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
                      <td colSpan="6" className="tabela-vazia">
                        Nenhum material adicionado ao orçamento.
                      </td>
                    </tr>
                  ) : (
                    itensMateriais.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>{item.materialNome}</div>

                          {calcularFaltaItemOrcamento(item) > 0 && (
                            <span className="material-sera-comprado">
                              Será comprado: {calcularFaltaItemOrcamento(item)}
                            </span>
                          )}
                        </td>
                        <td>{item.quantidade}</td>
                        <td>{item.unidade || '-'}</td>
                        <td>{formatarValor(item.valorUnitario)}</td>
                        <td>
                          <strong>{formatarValor(item.subtotal)}</strong>
                        </td>
                        <td>
                          <button
                            className="botao-excluir"
                            onClick={() => excluirMaterial(item.id)}
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
                <strong>{formatarValor(totalMateriais)}</strong>
              </div>

              <div className="total-linha">
                <span>Mão de obra</span>
                <strong>
                  {formatarValor(orcamentoSelecionado.valorMaoObra)}
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
                  {formatarValor(orcamentoSelecionado.valor)}
                </strong>
              </div>

            </div>

            {orcamentoSelecionado.status === 'PENDENTE' && (
              <div className="formulario-botoes">
                <button
                  className="botao-aprovar"
                  onClick={aprovarOrcamento}
                >
                  Aprovar orçamento
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    )
  }

  /*
   * LISTA DE ORÇAMENTOS
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

          <button
            className="botao-novo"
            onClick={novoOrcamento}
          >
            + Novo orçamento
          </button>

        </div>
      </div>

      <div className="orcamentos-tabela">

        <div className="orcamentos-tabela-header">
          <div>
            <h2>Orçamentos cadastrados</h2>

            <span>
              {orcamentosFiltrados.length}{' '}
              {orcamentosFiltrados.length === 1
                ? 'orçamento encontrado'
                : 'orçamentos encontrados'}
            </span>
          </div>

          <div className="orcamentos-pesquisa">
            <input
              type="text"
              placeholder="Pesquisar por projeto, ambiente, status ou descrição..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>
        </div>

        {orcamentosFiltrados.length === 0 ? (
          <div className="orcamentos-vazio">
            <h3>
              {orcamentos.length === 0
                ? 'Nenhum orçamento cadastrado'
                : 'Nenhum orçamento encontrado'}
            </h3>

            <p>
              {orcamentos.length === 0
                ? 'Os orçamentos cadastrados aparecerão aqui.'
                : 'Tente pesquisar por outro projeto, ambiente ou descrição.'}
            </p>
          </div>
        ) : (
          <div className="tabela-container">
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
                {orcamentosFiltrados.map((orcamento) => (
                  <tr key={orcamento.id} className="linha-com-menu">
                    <td>{orcamento.projetoNome || '-'}</td>
                    <td>{orcamento.ambienteNome || '-'}</td>
                    <td>{formatarValor(orcamento.valor)}</td>

                    <td>
                      <span
                        className={`status ${classeStatus(orcamento.status)}`}
                      >
                        {traduzirStatus(orcamento.status)}
                      </span>
                    </td>

                    <td>{formatarData(orcamento.dataCriacao)}</td>
                    <td>{formatarData(orcamento.dataValidade)}</td>
                    <td>{orcamento.descricao || '-'}</td>

                    <td>
  <div className="acoes">
    <button
      className="botao-abrir"
      onClick={() => abrirOrcamento(orcamento)}
    >
      Abrir
    </button>

    <div className="menu-acoes-linha">
      <button
        type="button"
        className="botao-tres-pontos"
        aria-label={`Mais opções para orçamento ${orcamento.id}`}
        aria-expanded={menuAberto === orcamento.id}
        onClick={() => alternarMenu(orcamento.id)}
      >
        ⋮
      </button>

      {menuAberto === orcamento.id && (
        <div className="menu-dropdown-linha">
          <button type="button" onClick={() => { setMenuAberto(null); abrirOrcamento(orcamento) }}>
            <span>✎</span> Editar
          </button>

          {orcamento.status === 'PENDENTE' && (
            <>
              <button type="button" onClick={() => { setMenuAberto(null); alterarStatusOrcamento(orcamento, 'APROVADO') }}>
                <span>✓</span> Aprovar
              </button>
              <button type="button" onClick={() => { setMenuAberto(null); alterarStatusOrcamento(orcamento, 'RECUSADO') }}>
                <span>↩</span> Recusar
              </button>
            </>
          )}

          <button type="button" className="opcao-excluir" onClick={() => { setMenuAberto(null); excluirOrcamento(orcamento.id) }}>
            <span>🗑️</span> Excluir
          </button>
        </div>
      )}
    </div>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}

export default Orcamentos
