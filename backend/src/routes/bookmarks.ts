import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const bookmarksRouter = Router();

// GET /api/bookmarks?userId=... - get bookmarks
bookmarksRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'user-vk';
    const list = db.getBookmarks(userId);
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookmarks/toggle - toggle bookmark
bookmarksRouter.post('/toggle', (req: Request, res: Response) => {
  try {
    const { userId, templeId } = req.body;
    if (!templeId) {
      res.status(400).json({ success: false, error: 'templeId is required' });
      return;
    }

    const activeUserId = userId || 'user-vk';
    const result = db.toggleBookmark(activeUserId, templeId);

    res.json({
      success: true,
      bookmarked: result.bookmarked,
      data: result.bookmarks,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
