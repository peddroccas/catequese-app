import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Troca %APP_NAME% no index.html pelo nome do produto (VITE_APP_NAME)
      name: 'app-name',
      transformIndexHtml: (html) =>
        html.replace(/%APP_NAME%/g, process.env.VITE_APP_NAME || 'Catequese'),
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // O NextUI traz cópias próprias do i18n; com mais de uma, o I18nProvider
    // pt-BR não chega aos campos de data e eles seguem o idioma do navegador
    // (mês/dia em navegador em inglês)
    dedupe: ['@react-aria/i18n'],
  },
})
