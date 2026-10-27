// Configuración de Vite: servidor de desarrollo (npm run dev) y build con el plugin de React.
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
