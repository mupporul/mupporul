import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const templesRouter = Router();

// GET /api/temples - with filters (planets, matchMode, deity, state, search)
templesRouter.get('/', (req: Request, res: Response) => {
  try {
    const { planets, planetMatchMode, deity, state, search } = req.query;

    let planetArray: string[] | undefined;
    if (typeof planets === 'string' && planets.trim()) {
      planetArray = planets.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(planets)) {
      planetArray = planets as string[];
    }

    const matchMode = planetMatchMode === 'exact' ? 'exact' : 'all';

    const results = db.getTemples({
      planets: planetArray,
      planetMatchMode: matchMode,
      deity: typeof deity === 'string' ? deity : undefined,
      state: typeof state === 'string' ? state : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/temples/:id - fetch single temple & increment views
templesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const temple = db.getTempleById(req.params.id);
    if (!temple) {
      res.status(404).json({ success: false, error: 'Temple not found' });
      return;
    }
    // Increment view count
    db.incrementTempleViews(req.params.id);
    res.json({ success: true, data: temple });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/temples - create direct temple (Admin only)
templesRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, location, state, planets, deity, significance, remedies, imageUrl, videoUrl, timings, history, poojaDetails, contactNumber } = req.body;

    if (!name || !location || !deity || !significance) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, location, deity, significance',
      });
      return;
    }

    const newTemple = db.createTemple({
      name,
      location,
      state: state || 'Tamil Nadu',
      planets: Array.isArray(planets) ? planets : [],
      deity,
      significance,
      remedies: Array.isArray(remedies) ? remedies : [],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      videoUrl: videoUrl || '',
      timings: timings || 'காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:30',
      history: history || '',
      poojaDetails: poojaDetails || '',
      contactNumber: contactNumber || '',
      submittedBy: req.body.submittedBy || {
        id: 'user-admin',
        name: 'Admin Murugan',
        role: 'admin',
      },
    });

    res.status(201).json({ success: true, data: newTemple });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/temples/:id - update temple
templesRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateTemple(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Temple not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/temples - clear all temples (Admin purge action)
templesRouter.delete('/', async (_req: Request, res: Response) => {
  try {
    await db.clearAllTemples();
    res.json({ success: true, message: 'All temples successfully cleared from database' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/temples/:id - delete single temple
templesRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteTemple(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Temple not found' });
      return;
    }
    res.json({ success: true, message: 'Temple successfully removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
