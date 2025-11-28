import Stripe from "stripe";
import Booking from "../models/Bookings.js";
import { sendEmail, generateConfirmationEmail } from "../utils/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("💡 Webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;

    try {
      const booking = await Booking.findById(bookingId)
        .populate({ path: "user", select: "name email" })
        .populate({ path: "show", populate: { path: "movie" } });

      if (!booking) return res.status(404).send("Booking not found");

      // ✅ Update booking as paid
      booking.isPaid = true;
      await booking.save();
      console.log(`✅ Booking marked as paid: ${booking._id}`);

      // ✅ Send confirmation email
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
    } catch (err) {
      console.error("❌ Error processing webhook:", err);
    }
  }

  res.json({ received: true });
};
