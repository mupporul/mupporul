import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { INITIAL_PLANETS, INITIAL_DEITIES } from '../db/initialData.js';

export const metaRouter = Router();

// GET /api/health - health check
metaRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Mupporul Backend REST API',
    tier: '100% Free Tier Supported (Render / Supabase / Local)',
  });
});

// GET /api/stats - admin analytics
metaRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/planets - list of 9 planets
metaRouter.get('/planets', (_req: Request, res: Response) => {
  res.json({ success: true, count: INITIAL_PLANETS.length, data: INITIAL_PLANETS });
});

// GET /api/deities - list of deities
metaRouter.get('/deities', (_req: Request, res: Response) => {
  res.json({ success: true, count: INITIAL_DEITIES.length, data: INITIAL_DEITIES });
});

// POST /api/reset - reset DB to initial seed defaults
metaRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    db.resetToDefaults();
    res.json({ success: true, message: 'Database reset to default seed state' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
