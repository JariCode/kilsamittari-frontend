import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Kehityksessä sovellus on juuressa, tuotannossa alapolussa /kilsamittari/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kilsamittari/' : '/',
  plugins: [react()],
}))
