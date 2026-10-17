import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createBackendApp } from './backend/src/app.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Create Express application with all /api routes mounted
  const app = createBackendApp();

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      root: path.resolve(__dirname, 'frontend'),
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files if dist exists, or provide API landing message
    const distPath = path.resolve(__dirname, 'dist');
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      app.get('/', (_req, res) => {
        res.json({
          status: 'online',
          service: 'Mupporul Backend API',
          message: 'Backend server is running on Render. Access /api/health or /api/temples.',
          health: '/api/health',
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FullStack] Mupporul server running on http://0.0.0.0:${PORT}`);
    console.log(`[FullStack] Backend API available at http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[FullStack] Error starting server:', err);
  process.exit(1);
});
