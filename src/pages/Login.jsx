import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const navigate = useNavigate()

  async function fazerLogin(event) {
    event.preventDefault()
    setErro('')

    try {
      const resposta = await api.post('/auth/login', {
        email: email,
        senha: senha
      })

      console.log('Resposta do login:', resposta.data)

  console.log('Resposta do login:', resposta.data)

localStorage.setItem('token', resposta.data.token)

const usuario = {
  id: resposta.data.id,
  nome: resposta.data.nome,
  email: resposta.data.email,
  perfil: resposta.data.perfil
}

localStorage.setItem('usuario', JSON.stringify(usuario))

console.log('Usuário salvo:', localStorage.getItem('usuario'))


      navigate('/dashboard')
    } catch (error) {
      setErro('E-mail ou senha inválidos.')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>MarcenariaPro</h1>
        <p>Gestão para sua marcenaria</p>

        <form onSubmit={fazerLogin}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login