import dotenv from 'dotenv';
dotenv.config();

import { createBackendApp } from './app.js';
import { isSupabaseConfigured } from './db/supabaseClient.js';

const app = createBackendApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Mupporul Backend] REST API Server running on port ${PORT}`);
  console.log(`[Mupporul Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[Mupporul Backend] Database: ${isSupabaseConfigured ? 'Supabase' : 'Local Persistent JSON DB'}`);
});
