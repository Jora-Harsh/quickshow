import Booking from "../models/Bookings.js";
import Show from "../models/Show.js";
import Stripe from "stripe";
import { sendEmail, generateConfirmationEmail } from "../utils/emailService.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------
// 📦 Create New Booking (NO WEBHOOK VERSION)
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

    // Stripe line items
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

    // 🆕 success_url contains session_id (important)
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
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


export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, message: "No session_id provided" });
    }

    // Fetch session direct from Stripe
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.json({ success: false, message: "Payment incomplete" });
    }

    const bookingId = session.metadata.bookingId;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 🔁 CHECK: if booking already paid, don't send email twice
    const firstTimePayment = !booking.isPaid;

    // Mark as paid
    booking.isPaid = true;
    await booking.save();

    // ✉️ Send confirmation email only on FIRST PAYMENT
    if (firstTimePayment) {
      try {
        const showTimeStr = booking.show?.showDateTime
          ? new Date(booking.show.showDateTime).toLocaleString()
          : booking.showTime || "Unknown Time";

        const html = generateConfirmationEmail({
          userName: booking.user.name,
          movieTitle: booking.show?.movie?.title || "Unknown Movie",
          theater: booking.theater,
          showTime: showTimeStr,
          seats: booking.bookedSeats,
          amount: booking.amount,
          currency: process.env.VITE_CURRENCY || "₹",
        });

        await sendEmail({
          to: booking.user.email,
          subject: "Booking Confirmed - QuickShow",
          html,
        });

        console.log(`✅ Confirmation email sent to ${booking.user.email}`);
      } catch (emailErr) {
        console.error("❌ Email sending failed:", emailErr);
      }
    }

    return res.json({ success: true, booking });

  } catch (error) {
    console.error("❌ Verify payment error:", error);
    res.status(500).json({ success: false, message: "Server error verifying payment" });
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
