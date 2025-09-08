// server.js
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';         
import 'dotenv/config';
import cookieParser  from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import path from "path";

const __dirname = path.resolve(); // ESM safe

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
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve static files from uploads folder
app.use('/api/auth', authRouter); // auth routes
app.use('/api/user', userRouter); // user routes



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



