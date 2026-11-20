import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const solutionTagsRouter = Router();

// GET /api/solution-tags - List all configured problem/solution tags
solutionTagsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const tags = db.getSolutionTags();
    res.json({ success: true, data: tags });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch solution tags' });
  }
});

// POST /api/solution-tags - Create a new problem/solution tag (Admin)
solutionTagsRouter.post('/', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { nameTamil, nameEnglish, id } = req.body;
    if (!nameTamil || !String(nameTamil).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Problem tag in Tamil (தமிழ் குறிச்சொல்) is required',
      });
    }

    const created = db.createSolutionTag({
      nameTamil: String(nameTamil).trim(),
      nameEnglish: nameEnglish ? String(nameEnglish).trim() : '',
      id: id ? String(id).trim() : undefined,
    });

    await db.flushSupabaseWrites();
    res.status(201).json({ success: true, data: created, message: 'Solution tag added successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create solution tag' });
  }
});

// PUT /api/solution-tags/:id - Update an existing problem/solution tag
solutionTagsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { id } = req.params;
    const { nameTamil, nameEnglish } = req.body;

    const updated = db.updateSolutionTag(id, { nameTamil, nameEnglish });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Solution tag not found' });
    }

    await db.flushSupabaseWrites();
    res.json({ success: true, data: updated, message: 'Solution tag updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update solution tag' });
  }
});

// DELETE /api/solution-tags/:id - Delete a problem/solution tag
solutionTagsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { id } = req.params;
    const success = db.deleteSolutionTag(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Solution tag not found' });
    }

    await db.flushSupabaseWrites();
    res.json({ success: true, message: 'Solution tag deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete solution tag' });
  }
});
