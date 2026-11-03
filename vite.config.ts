import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'asaas-local-proxy',
      configureServer(server) {
        server.middlewares.use('/api/asaas', (req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-asaas-key, x-asaas-env');
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }
          let rawBody = '';
          req.on('data', (chunk) => { rawBody += chunk; });
          req.on('end', async () => {
            try {
              const body = rawBody ? JSON.parse(rawBody) : {};
              const apiKey = req.headers['x-asaas-key'] || body.apiKey;
              const provider = req.headers['x-bank-provider'] || body.provider || 'ASAAS';
              const environment = req.headers['x-asaas-env'] || body.environment || 'production';
              const endpoint = body.endpoint;
              const method = body.method || 'GET';
              const payload = body.payload;

              let baseUrl = environment === 'sandbox'
                ? 'https://sandbox.asaas.com/api/v3'
                : 'https://api.asaas.com/v3';

              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'TerraGest-ERP/1.0'
              };

              if (provider === 'MERCADO_PAGO') {
                baseUrl = 'https://api.mercadopago.com';
                headers['Authorization'] = `Bearer ${String(apiKey || '').trim()}`;
                if (method === 'POST') {
                  headers['X-Idempotency-Key'] = `tg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                }
              } else {
                headers['access_token'] = String(apiKey || '').trim();
              }

              const cleanEndpoint = String(endpoint).startsWith('/') ? endpoint : `/${endpoint}`;
              const fetchOpts: RequestInit = { method, headers };
              if (payload && (method === 'POST' || method === 'PUT')) {
                fetchOpts.body = JSON.stringify(payload);
              }

              const response = await fetch(`${baseUrl}${cleanEndpoint}`, fetchOpts);
              const text = await response.text();
              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(text || '{}');
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Erro local Asaas' }));
            }
          });
        });
      }
    },
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
    port: 5173
  }
});
