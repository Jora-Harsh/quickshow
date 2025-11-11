import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getOccupiedSeats, // ✅ add this import
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// 🎟️ Create a new booking (user must be logged in)
bookingRouter.post("/", userAuth, createBooking);

// 📚 Get logged-in user's all bookings
bookingRouter.get("/my-bookings", userAuth, getMyBookings);

// 🧾 (Optional) Get all bookings (for admin panel)
bookingRouter.get("/all", userAuth, getAllBookings);

// 💺 Get occupied seats for a particular show
bookingRouter.get("/occupied-seats/:showId", userAuth, getOccupiedSeats); // ✅ add this route

export default bookingRouter;
