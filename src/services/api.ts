import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
})
