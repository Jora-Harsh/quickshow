import express from "express";
import { verifyPayment } from "../controllers/bookingController.js";

const router = express.Router();

// 🔍 Verify Stripe payment (NO WEBHOOK)
router.get("/verify", verifyPayment);

export default router;
