import express from "express";
import { getAllBookings, getAllShows, getDashboardData, isAdmin } from "../controllers/adminController.js";
import { get } from "mongoose";

const adminRouter = express.Router();

adminRouter.get('/is-admin', isAdmin);
adminRouter.get('/dashboard', getDashboardData);
adminRouter.get('/all-shows', getAllShows);
adminRouter.get('/all-bookings', getAllBookings);

export default adminRouter;