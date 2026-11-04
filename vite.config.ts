import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
