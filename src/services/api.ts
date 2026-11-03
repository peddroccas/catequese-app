import axios, { AxiosError } from 'axios'

export const TOKEN_KEY = 'auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
})

// Envia o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token expirado ou inválido: volta para o login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes('/catechists/auth')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) {
      return message
        .map((item) => (typeof item === 'string' ? item : item.property))
        .join(', ')
    }
    if (typeof message === 'string') {
      return message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Erro inesperado, tente novamente'
}
