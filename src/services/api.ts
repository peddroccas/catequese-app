import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.DATABASE_URL, // https://catequese-api.onrender.com
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
})
