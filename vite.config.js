import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Sovellus on juuressa sekä kehityksessä että tuotannossa (kilsamittari.jaricode.fi)
export default defineConfig({
  base: '/',
  plugins: [react()],
})