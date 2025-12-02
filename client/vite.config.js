import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // IMPORTANT for testing on phone + deployment compatibility
  server: {
    host: true,   // exposes the dev server to LAN
    port: 5173,   // consistent port
  },
});
