import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://catequese-api.onrender.com',
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
})
