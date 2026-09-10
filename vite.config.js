import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL ||
        (mode === 'production' ? 'https://school-backend-eosin-rho.vercel.app/api/v1' : '/api/v1')
    ),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5100',
    },
  },
}));
