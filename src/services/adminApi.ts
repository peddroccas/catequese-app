import axios from 'axios'

export const ADMIN_TOKEN_KEY = 'admin-auth'

// Cliente do painel do administrador: token próprio, que não se mistura com o
// login dos catequistas
export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token vencido ou inválido: volta para o login do administrador
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes('/admin/auth')
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  },
)
