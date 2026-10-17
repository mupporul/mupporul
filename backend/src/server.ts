import dotenv from 'dotenv';
dotenv.config();

import { createBackendApp } from './app.js';

const app = createBackendApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Mupporul Backend] REST API Server running on port ${PORT}`);
  console.log(`[Mupporul Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[Mupporul Backend] Database: ${process.env.DATABASE_URL ? 'Supabase / PostgreSQL' : 'Local Persistent JSON DB'}`);
});
