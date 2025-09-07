// server.js
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';         
import 'dotenv/config';
import cookieParser  from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({origin: "http://localhost:5173",credentials: true}));

connectDB(); // database connection


// ── API ENDPOINTS
app.get('/', (_req, res) => res.send('Server Is Live - Welcome to QuickShow!'));
app.use('/api/auth', authRouter); // auth routes
app.use('/api/user', userRouter); // user routes


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



