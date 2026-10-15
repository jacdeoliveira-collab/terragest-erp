import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404-html',
      closeBundle() {
        try {
          const indexHtml = path.resolve(process.cwd(), 'dist/index.html');
          const notFoundHtml = path.resolve(process.cwd(), 'dist/404.html');
          if (fs.existsSync(indexHtml)) {
            fs.copyFileSync(indexHtml, notFoundHtml);
          }
        } catch (e) {
          console.warn('Aviso copy 404:', e);
        }
      }
    }
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'jspdf',
      'jspdf-autotable',
      'jsqr',
      'jsrsasign',
      'tesseract.js',
      'recharts'
    ]
  },
  server: {
    host: true,
    port: 5173,
  },
});
