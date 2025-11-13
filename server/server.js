import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import path from 'path';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';

const __dirname = path.resolve();
const app = express();

// Stripe webhook (raw)
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Connect DB
connectDB();

// Routes
app.get('/', (_req, res) => res.send('Server is Live - Welcome to QuickShow!'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/shows', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/favorites', favoriteRoutes);

// ❌ REMOVE app.listen()
// ✅ Just export app
export default app;
