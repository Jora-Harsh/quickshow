// server/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';

const app = express();

await connectDB();

// middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// routes
app.get('/', (req, res) => res.send('Server Is Live'));
app.use('/api/inngest', serve({ client: inngest, functions }));

export default app;        
