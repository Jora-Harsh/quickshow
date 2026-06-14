import express from "express";
import { isAuthenticated, login, logout, register, resendVerification, resetPassword, sendResetOtp, verifyAccount } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import upload from "../configs/multer.js";

const authRouter = express.Router();

authRouter.post('/register',upload.single('profilePic'), register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
// authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.get('/verify-account', verifyAccount);
authRouter.post('/is-authenticated', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/resend-verification', resendVerification);

export default authRouter;