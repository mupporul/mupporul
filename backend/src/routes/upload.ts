import { Router, Request, Response } from 'express';
import { uploadImageToSupabaseStorage, isSupabaseConfigured } from '../db/supabaseClient.js';

export const uploadRouter = Router();

// POST /api/upload - uploads an image base64 directly to Supabase Storage bucket
uploadRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { imageBase64, fileName = 'temple.jpg', mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'Missing imageBase64 payload' });
      return;
    }

    if (!isSupabaseConfigured) {
      // If Supabase is not configured, we return the base64 or inform client to use direct URL
      res.json({
        success: true,
        source: 'local',
        url: imageBase64,
        message: 'Supabase storage is not configured; using local data URL fallback.',
      });
      return;
    }

    const uploadResult = await uploadImageToSupabaseStorage(imageBase64, fileName, mimeType);

    if (uploadResult.url) {
      res.json({
        success: true,
        source: 'supabase',
        url: uploadResult.url,
      });
    } else {
      // Fallback gracefully so temple creation never breaks
      res.json({
        success: true,
        source: 'local_fallback',
        url: imageBase64,
        warning: uploadResult.error || 'Failed to upload to Supabase bucket. Stored locally.',
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
