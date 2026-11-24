
import axios from 'axios'

console.log('AMBIENTE:', import.meta.env.MODE)
console.log('VARIAVEL API:', import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.marcenaria.org'
})

console.log('API CONFIGURADA:', api.defaults.baseURL)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
