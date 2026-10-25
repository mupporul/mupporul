import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const deitiesRouter = Router();

// GET /api/deities - List all deities
deitiesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const deities = db.getDeities();
    res.json({ success: true, data: deities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch deities' });
  }
});

// GET /api/deities/:id - Get deity by ID
deitiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const deity = db.getDeityById(req.params.id);
    if (!deity) {
      return res.status(404).json({ success: false, error: 'Deity not found' });
    }
    res.json({ success: true, data: deity });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch deity' });
  }
});

// POST /api/deities - Create a new deity (Accepts Tamil name)
deitiesRouter.post('/', (req: Request, res: Response) => {
  try {
    const { nameTamil, nameEnglish, id } = req.body;
    if (!nameTamil || !nameTamil.trim()) {
      return res.status(400).json({ success: false, error: 'Deity name in Tamil (மூலவர் பெயர்) is required' });
    }

    const newDeity = db.createDeity({
      nameTamil: nameTamil.trim(),
      nameEnglish: nameEnglish ? nameEnglish.trim() : nameTamil.trim(),
      id: id ? id.trim() : undefined,
    });

    res.status(201).json({ success: true, data: newDeity, message: 'Deity added successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create deity' });
  }
});

// PUT /api/deities/:id - Update an existing deity
deitiesRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nameTamil, nameEnglish } = req.body;

    const updated = db.updateDeity(id, { nameTamil, nameEnglish });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Deity not found' });
    }

    res.json({ success: true, data: updated, message: 'Deity updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update deity' });
  }
});

// DELETE /api/deities/:id - Delete a deity
deitiesRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = db.deleteDeity(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Deity not found or could not be deleted' });
    }

    res.json({ success: true, message: 'Deity deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete deity' });
  }
});
