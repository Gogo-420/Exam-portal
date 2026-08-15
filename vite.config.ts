import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Backend origin used for the dev proxy.
  // Defaults to localhost:8000 when VITE_API_BASE_URL is not set.
  const apiOrigin = env.VITE_API_BASE_URL
    ? new URL(env.VITE_API_BASE_URL).origin
    : 'http://localhost:8000';

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},

      // Proxy all /api/* requests to the backend during development.
      // This avoids CORS issues and means VITE_API_BASE_URL can stay empty
      // in .env.local while pointing at a real local server.
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
