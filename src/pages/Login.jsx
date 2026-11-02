
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff
} from 'lucide-react'

import api from '../services/api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

const [mostrarSenha, setMostrarSenha] = useState(false)

  const navigate = useNavigate()

  async function fazerLogin(event) {
    event.preventDefault()
    setErro('')

    try {
      const resposta = await api.post('/auth/login', {
        email,
        senha
      })

      localStorage.setItem('token', resposta.data.token)

      const usuario = {
        id: resposta.data.id,
        nome: resposta.data.nome,
        email: resposta.data.email,
        perfil: resposta.data.perfil
      }

      localStorage.setItem('usuario', JSON.stringify(usuario))

      navigate('/dashboard')
    } catch (error) {
      setErro('E-mail ou senha inválidos.')
    }
  }

  return (
    <div className="login-container">

      <div className="login-card">

        {/* Painel esquerdo */}
        <div className="login-painel">

          <img
            src="/McomMartelo.png"
            alt="MarcenariaPro"
            className="login-logo"
          />



        </div>

        {/* Painel direito */}
        <div className="login-conteudo">

          <div className="login-boas-vindas">
            <span>Bem-vindo ao</span>
            <h1>MarcenariaPro</h1>
            <div className="login-detalhe"></div>
            <p>Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={fazerLogin}>

            <div className="form-group">
              <label>E-mail</label>

              <div className="login-input-icon">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
                <label>Senha</label>

                <div className="login-input-icon">
                  <Lock size={18} />

                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="login-mostrar-senha"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
</div>

            {erro && <p className="login-erro">{erro}</p>}

            <button type="submit" className="login-botao">
              <LogIn size={17} />
              Entrar
            </button>

          </form>

          <div className="login-rodape">
            Seu negócio mais organizado e produtivo.
          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
