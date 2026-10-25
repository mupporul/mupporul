import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const submissionsRouter = Router();

// GET /api/submissions - list submissions
submissionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const { status, userId } = req.query;
    const list = db.getSubmissions(
      typeof status === 'string' ? status : undefined,
      typeof userId === 'string' ? userId : undefined
    );
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/submissions - create new or edit submission
submissionsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { type, templeId, templeData, previousData, submittedBy } = req.body;

    if (!type || !templeData || !submittedBy) {
      res.status(400).json({
        success: false,
        error: 'Missing required submission fields: type, templeData, submittedBy',
      });
      return;
    }

    const newSub = db.createSubmission({
      type: type === 'edit' ? 'edit' : 'new',
      templeId,
      templeData,
      previousData,
      submittedBy,
    });

    res.status(201).json({ success: true, data: newSub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/submissions/:id/review - approve or reject submission
submissionsRouter.put('/:id/review', async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase(true);
    const { action, reviewer, reviewNotes } = req.body;

    if (!action || !['approved', 'rejected'].includes(action)) {
      res.status(400).json({
        success: false,
        error: "Action must be either 'approved' or 'rejected'",
      });
      return;
    }

    const result = db.reviewSubmission(
      req.params.id,
      action as 'approved' | 'rejected',
      reviewer || { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
      reviewNotes
    );

    if (!result) {
      res.status(404).json({ success: false, error: 'Submission not found' });
      return;
    }

    res.json({
      success: true,
      message: `Submission marked as ${action}`,
      data: result.submission,
      temple: result.temple,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/submissions/:id - delete submission
submissionsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteSubmission(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Submission not found' });
      return;
    }
    res.json({ success: true, message: 'Submission deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

