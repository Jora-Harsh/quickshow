// server.js
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';         
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import  startBookingCleanupJob from './utils/bookingCleaner.js'; // ✅ Booking cleanup

const __dirname = path.resolve(); // ESM safe

const app = express();
const PORT = process.env.PORT || 3000;

// ── Stripe webhook routes (must be before express.json middleware)
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ── Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ── Connect Database
connectDB();

// ── Start booking cleanup background job
startBookingCleanupJob(); // ✅ This will run every minute and cancel unpaid bookings after 10 mins

// ── API Endpoints
app.get('/', (_req, res) => res.send('Server Is Live - Welcome to QuickShow!'));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

app.use('/api/auth', authRouter); // Auth routes
app.use('/api/user', userRouter); // User routes
app.use('/api/shows', showRouter); // Show routes
app.use('/api/bookings', bookingRouter); // Booking routes
app.use('/api/admin', adminRouter); // Admin routes
app.use("/api/favorites", favoriteRoutes); // Favorites

// ── Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
