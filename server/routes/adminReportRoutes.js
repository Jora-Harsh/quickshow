// routes/adminReportRoutes.js
import express from "express";
import {
  revenueByMovie,
  revenueByDate,
  paymentsList,
  refundsList,
  usersPurchases,
} from "../controllers/reportsController.js";
import { isAdmin } from "../middleware/userAuth.js"; // protect route if you have middleware

const router = express.Router();

// optionally protect all routes with isAdmin (uncomment if available)
router.get("/revenue/movie", /* isAdmin, */ revenueByMovie);
router.get("/revenue/date", /* isAdmin, */ revenueByDate); // ?dateBy=show|payment
router.get("/payments", /* isAdmin, */ paymentsList);
router.get("/refunds", /* isAdmin, */ refundsList);
router.get("/users", /* isAdmin, */ usersPurchases);

export default router;
