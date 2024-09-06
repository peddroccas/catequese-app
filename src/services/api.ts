import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // https://catequese-api.onrender.com
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
})
