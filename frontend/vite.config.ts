import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/uploads': 'http://localhost:3001',
      '/ai': 'http://localhost:3001',
      '/recipes': 'http://localhost:3001',
      // Ajoute d'autres proxys si besoin
    },
  },
  define: {
    'process.env': {}, // Pour compatibilité éventuelle
  },
});
