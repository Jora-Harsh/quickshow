import Booking from "../models/Bookings.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------
// 📦 Create New Booking
// -----------------------------
export const createBooking = async (req, res) => {
  try {
    const { showId, bookedSeats, amount, theater, date, showTime } = req.body;
    const { origin } = req.headers;

    if (!showId || !bookedSeats || !amount || !theater || !date || !showTime) {
      return res.status(400).json({ success: false, message: "Missing booking details" });
    }

    const showData = await Show.findById(showId).populate("movie");
    if (!showData) return res.status(404).json({ success: false, message: "Show not found" });

    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      theater,
      date,
      showTime,
      amount,
      bookedSeats,
      isPaid: false,
    });

    const line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: { name: `${showData.movie.title} - ${theater}` },
          unit_amount: Math.floor(booking.amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/my-bookings?paid=true`,
      cancel_url: `${origin}/my-bookings`,
      line_items,
      mode: "payment",
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking created successfully",
      url: session.url,
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
        populate: { path: "movie", model: "Movie" },
      })
      .sort({ createdAt: -1 });

    const totalPaid = bookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + b.amount, 0);

    return res.status(200).json({
      success: true,
      bookings,
      totalPaid,
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
        populate: { path: "movie", model: "Movie" },
      })
      .sort({ createdAt: -1 });

    const totalPaid = bookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + b.amount, 0);

    return res.status(200).json({
      success: true,
      bookings,
      totalPaid,
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
    const { theater, date, showTime } = req.query;

    const bookings = await Booking.find({ show: showId, theater, date, showTime });
    const occupiedSeats = bookings.flatMap(b => b.bookedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching seats" });
  }
};
