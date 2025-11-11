import Booking from "../models/Bookings.js";
import Show from "../models/Show.js";

// -----------------------------
// 📦 Create New Booking
// -----------------------------
export const createBooking = async (req, res) => {
  try {
    const { showId, bookedSeats, amount, theater, date } = req.body;

    if (!showId || !bookedSeats || !amount || !theater || !date) {
      return res.status(400).json({ success: false, message: "Missing booking details" });
    }

    // Create booking with theater + date
    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      theater,
      date,
      amount,
      bookedSeats,
      isPaid: false,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return res.status(500).json({ success: false, message: "Server error while creating booking" });
  }
};

// -----------------------------
// 🎟️ Get User Bookings
// -----------------------------
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "Movie",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching bookings" });
  }
};

// -----------------------------
// 📋 Get All Bookings (Admin)
// -----------------------------
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "Movie",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching all bookings:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching all bookings" });
  }
};

// -----------------------------
// 💺 Get Occupied Seats for a Show
// -----------------------------
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { theater, date } = req.query;

    const bookings = await Booking.find({ show: showId, theater, date });
    const occupiedSeats = bookings.flatMap(b => b.bookedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching seats" });
  }
};


