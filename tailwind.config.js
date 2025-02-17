/** @type {import('tailwindcss').Config} */
import { heroui } from '@heroui/react'

export default {
  content: [
    './src/**/*.{html,tsx,ts}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
  plugins: [heroui()],
}
