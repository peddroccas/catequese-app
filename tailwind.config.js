/** @type {import('tailwindcss').Config} */
import { nextui } from '@nextui-org/react'

export default {
  content: [
    './src/**/*.{html,tsx,ts}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta da marca Catequese Hub (Figma › Branding › 09)
        // Base quente: fundo das páginas e bordas
        creme: {
          50: '#FBF9F5',
          100: '#F7F4EE',
          200: '#E7E1D6',
          300: '#D6CDBE',
        },
        // Destaque: item ativo do menu, avisos e novidades. Também é a cor da Eucaristia
        ouro: {
          50: '#FBF6EA',
          100: '#F5EAD0',
          200: '#EED9A6',
          300: '#E2C47F',
          500: '#C9993A',
          600: '#A87C2A',
          700: '#86611F',
        },
        // Cores litúrgicas das etapas: Pré-Eucaristia, Crisma e Adultos
        verde: { 50: '#EEF5EC', 100: '#D8E9D4', 500: '#4E8A4A', 700: '#36643A' },
        vermelho: {
          50: '#FBEDEC',
          100: '#F5D3D1',
          500: '#B8403A',
          700: '#8E2B27',
        },
        roxo: { 50: '#F3EEF8', 100: '#E2D7EE', 500: '#6E4F96', 700: '#523A72' },
        blue: {
          50: '#eaf9ff',
          100: '#d1f2ff',
          200: '#ade9ff',
          300: '#74deff',
          400: '#33c8ff',
          500: '#04a6ff',
          600: '#007fff',
          700: '#0066ff',
          800: '#0054d9',
          900: '#004caa',
          950: '#052d63',
        },

        yellow: {
          50: '#fefee8',
          100: '#feffc2',
          200: '#fffd87',
          300: '#fff443',
          400: '#ffe723',
          500: '#efcc03',
          600: '#ce9f00',
          700: '#a47204',
          800: '#88580b',
          900: '#734810',
          950: '#432605',
        },
        bunker: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d1dae6',
          300: '#a9bbd0',
          400: '#7b97b5',
          500: '#5a7a9d',
          600: '#466183',
          700: '#3a4f6a',
          800: '#334459',
          900: '#2e3b4c',
          950: '#141921',
        },
        tuna: {
          50: '#f6f6f9',
          100: '#ededf1',
          200: '#d7d8e0',
          300: '#b4b7c5',
          400: '#8b8fa5',
          500: '#6c708b',
          600: '#575a72',
          700: '#47495d',
          800: '#3d3f4f',
          900: '#30313c',
          950: '#24242d',
        },
      },
    },
  },
  plugins: [
    nextui({
      defaultTheme: 'light',
      themes: {
        // Tema claro com o azul-ardósia (bunker) do cabeçalho como cor principal
        light: {
          colors: {
            background: '#F7F4EE',
            foreground: '#2e3b4c',
            focus: '#7b97b5',
            primary: {
              50: '#f5f7fa',
              100: '#eaeef4',
              200: '#d1dae6',
              300: '#a9bbd0',
              400: '#7b97b5',
              500: '#5a7a9d',
              600: '#466183',
              700: '#3a4f6a',
              800: '#334459',
              900: '#2e3b4c',
              DEFAULT: '#3a4f6a',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
}
