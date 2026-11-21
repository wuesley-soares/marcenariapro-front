
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Estoque.css'

function Estoque() {
  const [materiais, setMateriais] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [necessidades, setNecessidades] = useState([])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarMovimentacao, setMostrarMovimentacao] = useState(false)

  const [materialEditando, setMaterialEditando] = useState(null)

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    quantidade: '',
    estoqueMinimo: '',
    valorUnitario: '',
    unidadeMedida: 'UN'
  })

  const [formularioMovimentacao, setFormularioMovimentacao] = useState({
    materialId: '',
    tipo: 'ENTRADA',
    quantidade: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [
        respostaMateriais,
        respostaMovimentacoes,
        respostaNecessidades
      ] = await Promise.all([
        api.get('/materiais'),
        api.get('/movimentacoes-estoque'),
        api.get('/necessidades-compra')
      ])

      setMateriais(respostaMateriais.data || [])
      setMovimentacoes(respostaMovimentacoes.data || [])
      setNecessidades(respostaNecessidades.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error)

      const mensagem =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Não foi possível carregar os dados do estoque.'

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

  function alterarCampoMovimentacao(event) {
    const { name, value } = event.target

    setFormularioMovimentacao({
      ...formularioMovimentacao,
      [name]: value
    })
  }

function novoMaterial() {
  setMaterialEditando(null)

  setFormulario({
    nome: '',
    descricao: '',
    quantidade: '',
    estoqueMinimo: '',
    valorUnitario: '',
    unidadeMedida: 'UN'
  })

  setMostrarFormulario(true)
}

  function editarMaterial(material) {
    setMaterialEditando(material)

    setFormulario({
      nome: material.nome || '',
      descricao: material.descricao || '',
      quantidade: material.quantidade ?? '',
      estoqueMinimo: material.estoqueMinimo ?? '',
      valorUnitario: material.valorUnitario ?? '',
      unidadeMedida: material.unidadeMedida || 'UN'
    })

    setMostrarFormulario(true)
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setMaterialEditando(null)

    setFormulario({
      nome: '',
      descricao: '',
      quantidade: '',
      estoqueMinimo: '',
      valorUnitario: '',
      unidadeMedida: 'UN'
    })
  }

  async function salvarMaterial(event) {
    event.preventDefault()

    try {
          const dados = {
        nome: formulario.nome,
        descricao: formulario.descricao,
        quantidade: Number(formulario.quantidade),
        estoqueMinimo: Number(formulario.estoqueMinimo),
        valorUnitario: Number(formulario.valorUnitario),
        unidadeMedida: formulario.unidadeMedida
      }

      if (materialEditando) {
        await api.put(`/materiais/${materialEditando.id}`, dados)
        alert('Material atualizado com sucesso!')
      } else {
        await api.post('/materiais', dados)
        alert('Material cadastrado com sucesso!')
      }

      cancelarFormulario()
      await carregarDados()
    } catch (error) {
      console.error('Erro ao salvar material:', error)

      const mensagem =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Erro ao salvar material.'

      alert(mensagem)
    }
  }

  async function excluirMaterial(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este material?'
    )

    if (!confirmar) return

    try {
      await api.delete(`/materiais/${id}`)

      alert('Material excluído com sucesso!')

      await carregarDados()
    } catch (error) {
      console.error('Erro ao excluir material:', error)

      const mensagem =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Não foi possível excluir o material.'

      alert(mensagem)
    }
  }

  function novaMovimentacao() {
    setFormularioMovimentacao({
      materialId: '',
      tipo: 'ENTRADA',
      quantidade: ''
    })

    setMostrarMovimentacao(true)
  }

  function cancelarMovimentacao() {
    setMostrarMovimentacao(false)

    setFormularioMovimentacao({
      materialId: '',
      tipo: 'ENTRADA',
      quantidade: ''
    })
  }

  async function salvarMovimentacao(event) {
    event.preventDefault()

    try {
      const dados = {
        materialId: Number(formularioMovimentacao.materialId),
        tipo: formularioMovimentacao.tipo,
        quantidade: Number(formularioMovimentacao.quantidade)
      }

      await api.post('/movimentacoes-estoque', dados)

      alert('Movimentação registrada com sucesso!')

      cancelarMovimentacao()

      // Atualiza materiais, movimentações e necessidades de compra.
      await carregarDados()
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)

      const mensagem =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Erro ao registrar movimentação.'

      alert(mensagem)
    }
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

function formatarQuantidade(quantidade) {
  return Number(quantidade || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 3
  })
}
  function formatarData(data) {
    if (!data) return '-'

    return new Date(data).toLocaleString('pt-BR')
  }

  function estoqueBaixo(material) {
    return (
      material.estoqueMinimo != null &&
      material.quantidade <= material.estoqueMinimo
    )
  }

  function encontrarMaterial(id) {
    return materiais.find(
      (material) => Number(material.id) === Number(id)
    )
  }

  function textoTipo(tipo) {
    if (tipo === 'ENTRADA') return 'Entrada'
    if (tipo === 'SAIDA') return 'Saída'

    return 'Desconhecido'
  }

  function textoStatusNecessidade(status) {
    if (status === 'ABERTA') return 'Pendente'
    if (status === 'PARCIAL') return 'Parcial'
    if (status === 'ATENDIDA') return 'Atendida'
    if (status === 'CANCELADA') return 'Cancelada'

    return status || '-'
  }

  function classeStatusNecessidade(status) {
    if (status === 'ABERTA') return 'status-necessidade-aberta'
    if (status === 'PARCIAL') return 'status-necessidade-parcial'
    if (status === 'ATENDIDA') return 'status-necessidade-atendida'
    if (status === 'CANCELADA') return 'status-necessidade-cancelada'

    return ''
  }

  function textoOrigemNecessidade(necessidade) {
    if (necessidade.itemProducaoId) {
      return `Produção #${necessidade.itemProducaoId}`
    }

    if (necessidade.itemAssistenciaId) {
      return `Assistência #${necessidade.itemAssistenciaId}`
    }

    return '-'
  }

  // Exibe somente necessidades que ainda possuem material pendente.
  const necessidadesAtivas = necessidades.filter(
    (necessidade) =>
      necessidade.status === 'ABERTA' ||
      necessidade.status === 'PARCIAL'
  )

  const totalQuantidadePendente = necessidadesAtivas.reduce(
    (total, necessidade) =>
      total + Number(necessidade.quantidadePendente || 0),
    0
  )

  return (
    <div className="estoque">

      <div className="estoque-header">
        <div>
          <h1>Estoque</h1>
          <p>Controle dos materiais disponíveis</p>
        </div>

        <div className="estoque-header-botoes">
          <button
            className="botao-movimentacao"
            onClick={novaMovimentacao}
          >
            Registrar movimentação
          </button>

          <button
            className="botao-novo"
            onClick={novoMaterial}
          >
            Novo material
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="estoque-formulario">

          <h2>
            {materialEditando
              ? 'Editar material'
              : 'Novo material'}
          </h2>

          <form onSubmit={salvarMaterial}>

            <div className="campo">
              <label>Nome do material</label>

              <input
                type="text"
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                placeholder="Ex.: MDF Branco 18mm"
                required
              />
            </div>

            <div className="campo">
              <label>Descrição</label>

              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                placeholder="Descrição do material"
                rows="3"
              />
            </div>

            <div className="campos-linha">

              <div className="campo">
                <label>
                  {materialEditando
                    ? 'Quantidade atual'
                    : 'Quantidade inicial'}
                </label>

              <input
                type="number"
                name="quantidade"
                value={formulario.quantidade}
                onChange={alterarCampo}
                min="0"
                step={formulario.unidadeMedida === 'UN' ? '1' : '0.001'}
                required
              />
              </div>

              <div className="campo">
                <label>Estoque mínimo</label>

                  <input
                    type="number"
                    name="estoqueMinimo"
                    value={formulario.estoqueMinimo}
                    onChange={alterarCampo}
                    min="0"
                    step={formulario.unidadeMedida === 'UN' ? '1' : '0.001'}
                    required
                  />
              </div>

              <div className="campo">
                <label>Valor unitário</label>

                <input
                  type="number"
                  name="valorUnitario"
                  value={formulario.valorUnitario}
                  onChange={alterarCampo}
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  required
                />
              </div>

               <div className="campo">
              <label>Unidade de medida</label>

              <select
                name="unidadeMedida"
                value={formulario.unidadeMedida}
                onChange={alterarCampo}
                required
              >
                <option value="UN">Unidade (UN)</option>
                <option value="M">Metro (M)</option>
                <option value="M2">Metro quadrado (M²)</option>
                <option value="M3">Metro cúbico (M³)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="L">Litro (L)</option>
                <option value="MM">Milímetro (MM)</option>
              </select>
            </div>

            </div>

            {materialEditando && (
              <p className="aviso-estoque">
                A quantidade atual não é alterada pela edição.
                Utilize uma movimentação para registrar entradas ou saídas.
              </p>
            )}

            <div className="formulario-botoes">

              <button
                type="button"
                onClick={cancelarFormulario}
              >
                Cancelar
              </button>

              <button type="submit">
                {materialEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
              </button>

            </div>

          </form>

        </div>
      )}

      {mostrarMovimentacao && (
        <div className="estoque-formulario">

          <h2>Registrar movimentação</h2>

          <form onSubmit={salvarMovimentacao}>

            <div className="campos-linha">

              <div className="campo">
                <label>Material</label>

                <select
                  name="materialId"
                  value={formularioMovimentacao.materialId}
                  onChange={alterarCampoMovimentacao}
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
                      {material.nome} — estoque: {material.quantidade} {material.unidadeMedida}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Tipo</label>

                <select
                  name="tipo"
                  value={formularioMovimentacao.tipo}
                  onChange={alterarCampoMovimentacao}
                  required
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>
              </div>

              <div className="campo">
                <label>
                  Quantidade
                  {formularioMovimentacao.materialId && (
                    ` (${encontrarMaterial(
                      formularioMovimentacao.materialId
                    )?.unidadeMedida || ''})`
                  )}
                </label>

                <input
                  type="number"
                  name="quantidade"
                  value={formularioMovimentacao.quantidade}
                  onChange={alterarCampoMovimentacao}
                  min="0.001"
                  step={
                    encontrarMaterial(formularioMovimentacao.materialId)
                      ?.unidadeMedida === 'UN'
                      ? '1'
                      : '0.001'
                  }
                  placeholder="Informe a quantidade"
                  required
                />
              </div>

            </div>

            <div className="formulario-botoes">

              <button
                type="button"
                onClick={cancelarMovimentacao}
              >
                Cancelar
              </button>

              <button type="submit">
                Registrar
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="estoque-resumo">

        <div className="resumo-card">
          <span>Total de materiais</span>
          <strong>{materiais.length}</strong>
        </div>

        <div className="resumo-card">
          <span>Estoque baixo</span>

          <strong>
            {materiais.filter(estoqueBaixo).length}
          </strong>
        </div>

        <div className="resumo-card resumo-card-pendencias">
          <span>Necessidades de compra</span>
          <strong>{necessidadesAtivas.length}</strong>
          <small>
            {formatarQuantidade(totalQuantidadePendente)} unidades pendentes
          </small>
        </div>

        <div className="resumo-card">
          <span>Movimentações</span>
          <strong>{movimentacoes.length}</strong>
        </div>

      </div>

      {/* NECESSIDADES DE COMPRA */}
      <div className="estoque-tabela">

        <div className="estoque-secao-header">
          <div>
            <h2>Materiais pendentes de compra</h2>
            <p>
              Materiais que ainda precisam ser recebidos para liberar
              a produção ou atender às assistências técnicas.
            </p>
          </div>

          <span className="contador-pendencias">
            {necessidadesAtivas.length} pendente(s)
          </span>
        </div>

        <div className="estoque-tabela-scroll">
          <table className="tabela-necessidades">

            <thead>
              <tr>
                <th>Material</th>
                <th>Origem</th>
                <th>Quantidade necessária</th>
                <th>Quantidade recebida</th>
                <th>Quantidade pendente</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {necessidadesAtivas.length > 0 ? (
                necessidadesAtivas.map((necessidade) => (
                  <tr key={necessidade.id}>

                    <td className="celula-material">
                      {necessidade.materialNome || '-'}
                    </td>

                    <td>
                      {textoOrigemNecessidade(necessidade)}
                    </td>

                    <td>
                      {formatarQuantidade(
                        necessidade.quantidadeNecessaria
                      )}
                    </td>

                    <td>
                      {formatarQuantidade(
                        necessidade.quantidadeAtendida
                      )}
                    </td>

                    <td className="quantidade-pendente">
                      {formatarQuantidade(
                        necessidade.quantidadePendente
                      )}
                    </td>

                    <td>
                      {formatarData(necessidade.dataCriacao)}
                    </td>

                    <td>
                      <span
                        className={`status-necessidade ${classeStatusNecessidade(
                          necessidade.status
                        )}`}
                      >
                        {textoStatusNecessidade(necessidade.status)}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="tabela-vazia">
                    <span className="tabela-vazia-titulo">
                      Nenhuma necessidade de compra pendente
                    </span>
                    <span>
                      Quando faltar material para uma produção ou assistência,
                      a necessidade aparecerá nesta seção.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* MATERIAIS */}
      <div className="estoque-tabela">

        <h2>Materiais</h2>

        <div className="estoque-tabela-scroll">
          <table>

            <thead>
              <tr>
                <th>Material</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Estoque mínimo</th>
                <th>Valor unitário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>

              {materiais.length > 0 ? (
                materiais.map((material) => (

                  <tr key={material.id}>

                    <td>{material.nome}</td>

                    <td>
                      {material.descricao || '-'}
                    </td>

                    <td>
                      {material.quantidade}
                    </td>

                    <td>
                      {material.estoqueMinimo}
                    </td>

                    <td>
                      {formatarValor(material.valorUnitario)}
                    </td>

                    <td>

                      {estoqueBaixo(material) ? (
                        <span className="status-baixo">
                          Estoque baixo
                        </span>
                      ) : (
                        <span className="status-normal">
                          Normal
                        </span>
                      )}

                    </td>

                    <td>

                      <div className="acoes">

                        <button
                          className="botao-editar"
                          onClick={() => editarMaterial(material)}
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() => excluirMaterial(material.id)}
                        >
                          Excluir
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td colSpan="7" className="tabela-vazia">
                    Nenhum material cadastrado.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

      </div>

      {/* HISTÓRICO DE MOVIMENTAÇÕES */}
      <div className="estoque-tabela">

        <h2>Histórico de movimentações</h2>

        <div className="estoque-tabela-scroll">

          <table>

            <thead>
              <tr>
                <th>Movimentação</th>
                <th>Material</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>

              {movimentacoes.length > 0 ? (
                movimentacoes.map((movimentacao) => (

                  <tr key={movimentacao.id}>

                    <td>
                      #{movimentacao.id}
                    </td>

                    <td>
                      {movimentacao.materialNome ||
                        encontrarMaterial(movimentacao.materialId)?.nome ||
                        `Material #${movimentacao.materialId}`}
                    </td>

                    <td>

                      <span
                        className={
                          movimentacao.tipo === 'ENTRADA'
                            ? 'tipo-entrada'
                            : 'tipo-saida'
                        }
                      >
                        {textoTipo(movimentacao.tipo)}
                      </span>

                    </td>

                    <td>
                      {movimentacao.quantidade}
                    </td>

                    <td>
                      {formatarData(
                        movimentacao.dataMovimentacao
                      )}
                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td colSpan="5" className="tabela-vazia">
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default Estoque
