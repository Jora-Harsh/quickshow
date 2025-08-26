// server.js
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';         
import { clerkMiddleware } from '@clerk/express'; 
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';

const app = express();

// ── middleware
app.use(express.json());
app.use(cors());

// Clerk might throw if keys missing; keep it optional-safe:
try { app.use(clerkMiddleware()); } catch (e) {
  console.warn('Clerk middleware skipped:', e?.message);
}

// ── routes
app.get('/', (_req, res) => res.send('Server Is Live'));
app.use('/api/inngest', serve({ client: inngest, functions }));

// ── connect DB lazily so cold-start doesn’t crash the function
(async () => {
  try {
    await connectDB();
    console.log('DB connected');
  } catch (e) {
    console.error('DB connect failed (will retry on next cold start):', e?.message);
  }
})();

// ⛔️ No app.listen on Vercel
export default app;
