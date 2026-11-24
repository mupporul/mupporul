import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { INITIAL_PLANETS } from '../db/initialData.js';

export const naamaVilakkamRouter = Router();

const VALID_PLANET_IDS = new Set(INITIAL_PLANETS.map(p => p.id));

const canAddOrEditNaama = (role: unknown): boolean =>
  role === 'admin' || role === 'contributor' || role === 'user';

const canDeleteNaama = (role: unknown): boolean =>
  role === 'admin' || role === 'contributor';

// GET /api/naama-vilakkam/feature-toggle - Get feature toggle status
naamaVilakkamRouter.get('/feature-toggle', async (_req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const enabled = db.getNaamaVilakkamEnabled();
    res.json({ success: true, enabled });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to read feature toggle' });
  }
});

// PUT /api/naama-vilakkam/feature-toggle - Admin toggle ON/OFF
naamaVilakkamRouter.put('/feature-toggle', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { enabled, actorRole } = req.body || {};
    if (actorRole !== undefined && actorRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can change feature toggles',
      });
    }
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Boolean field "enabled" is required',
      });
    }
    const next = db.setNaamaVilakkamEnabled(enabled);
    await db.flushSupabaseWrites();
    res.json({ success: true, enabled: next });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update feature toggle' });
  }
});

// GET /api/naama-vilakkam - List all Tamil-only Naama Vilakkam entries + feature toggle
naamaVilakkamRouter.get('/', async (_req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const enabled = db.getNaamaVilakkamEnabled();
    const entries = db.getNaamaVilakkamList();
    res.json({ success: true, enabled, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch Naama Vilakkam entries' });
  }
});

// POST /api/naama-vilakkam - Create entry (User, Contributor & Admin)
naamaVilakkamRouter.post('/', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { nameTamil, planets, notes, createdBy, actorRole } = req.body || {};

    const roleToCheck = actorRole || createdBy?.role;
    if (roleToCheck !== undefined && !canAddOrEditNaama(roleToCheck)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized role for adding Naama Vilakkam entries',
      });
    }

    if (!nameTamil || !String(nameTamil).trim()) {
      return res.status(400).json({
        success: false,
        error: 'நாமம் (தமிழ்) அவசியம் (Tamil name is required)',
      });
    }

    const cleanPlanets = Array.isArray(planets)
      ? Array.from(new Set(planets.map(p => String(p).trim()).filter(p => VALID_PLANET_IDS.has(p))))
      : [];

    if (cleanPlanets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'குறைந்தது ஒரு கிரகத்தைத் தேர்ந்தெடுக்கவும் (At least one planet is required)',
      });
    }

    const created = db.createNaamaVilakkam({
      nameTamil: String(nameTamil).trim(),
      planets: cleanPlanets,
      notes: notes ? String(notes).trim() : '',
      createdBy: createdBy && typeof createdBy === 'object' ? createdBy : undefined,
    });

    await db.flushSupabaseWrites();
    res.status(201).json({ success: true, data: created, message: 'நாம விளக்கம் சேர்க்கப்பட்டது!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create Naama Vilakkam entry' });
  }
});

// PUT /api/naama-vilakkam/:id - Update entry (User, Contributor & Admin)
naamaVilakkamRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { id } = req.params;
    const { nameTamil, planets, notes, actorRole } = req.body || {};

    if (actorRole !== undefined && !canAddOrEditNaama(actorRole)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized role for editing Naama Vilakkam entries',
      });
    }

    if (nameTamil !== undefined && !String(nameTamil).trim()) {
      return res.status(400).json({
        success: false,
        error: 'நாமம் (தமிழ்) காலியாக இருக்கக் கூடாது',
      });
    }

    let cleanPlanets: string[] | undefined;
    if (planets !== undefined) {
      cleanPlanets = Array.isArray(planets)
        ? Array.from(new Set(planets.map(p => String(p).trim()).filter(p => VALID_PLANET_IDS.has(p))))
        : [];
      if (cleanPlanets.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'குறைந்தது ஒரு கிரகத்தைத் தேர்ந்தெடுக்கவும்',
        });
      }
    }

    const updated = db.updateNaamaVilakkam(id, {
      nameTamil: nameTamil !== undefined ? String(nameTamil).trim() : undefined,
      planets: cleanPlanets,
      notes: notes !== undefined ? String(notes).trim() : undefined,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Naama Vilakkam entry not found' });
    }

    await db.flushSupabaseWrites();
    res.json({ success: true, data: updated, message: 'நாம விளக்கம் புதுப்பிக்கப்பட்டது!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update Naama Vilakkam entry' });
  }
});

// DELETE /api/naama-vilakkam/:id - Delete entry (Contributor & Admin only)
naamaVilakkamRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { id } = req.params;
    const actorRole = req.query.actorRole || req.body?.actorRole;

    if (actorRole !== undefined && !canDeleteNaama(actorRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only contributors and administrators can delete Naama Vilakkam entries',
      });
    }

    const success = db.deleteNaamaVilakkam(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Naama Vilakkam entry not found' });
    }

    await db.flushSupabaseWrites();
    res.json({ success: true, message: 'நாம விளக்கம் நீக்கப்பட்டது' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete Naama Vilakkam entry' });
  }
});
