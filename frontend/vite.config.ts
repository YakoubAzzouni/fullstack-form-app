import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows Docker to expose the dev server
    port: 3000, // ensure the port matches your docker-compose mapping
  },
})
