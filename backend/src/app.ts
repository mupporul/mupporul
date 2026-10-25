import express, { Express } from 'express';
import cors from 'cors';
import { templesRouter } from './routes/temples.js';
import { submissionsRouter } from './routes/submissions.js';
import { usersRouter } from './routes/users.js';
import { metaRouter } from './routes/meta.js';
import { uploadRouter } from './routes/upload.js';
import { deitiesRouter } from './routes/deities.js';

export function createBackendApp(): Express {
  const app = express();

  // Middleware - Allow all CORS origins, methods, and headers
  app.use(cors({
    origin: '*', // Allows GitHub Pages, local dev, Vercel, Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Cache-Control', 'Pragma', 'Expires'],
  }));
  app.options('*', cors());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Prevent API caching so clients always receive 100% fresh data
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Mount API Routes
  app.use('/api/temples', templesRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/deities', deitiesRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api', metaRouter);

  return app;
}
