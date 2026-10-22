import express, { Express } from 'express';
import cors from 'cors';
import { templesRouter } from './routes/temples.js';
import { submissionsRouter } from './routes/submissions.js';
import { usersRouter } from './routes/users.js';
import { metaRouter } from './routes/meta.js';
import { uploadRouter } from './routes/upload.js';

export function createBackendApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*', // Allows GitHub Pages, local dev, Vercel, Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API Routes
  app.use('/api/temples', templesRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api', metaRouter);

  return app;
}
