import Booking from "../models/Bookings.js";
import User from "../models/userModel.js";
import Show from "../models/Show.js";
import { sendEmail, generateCancellationEmail } from "./emailService.js";

const CANCEL_AFTER_MINUTES = 10;

const cancelOldBookings = async () => {
  console.log("🕐 Running booking cleanup check...");

  try {
    // Get all unpaid bookings
    const unpaidBookings = await Booking.find({ isPaid: false })
      .populate("user") // populate user info
      .populate({
        path: "show",
        model: "Show",
        populate: {
          path: "movie",
          model: "Movie"
        }
      });

    if (!unpaidBookings.length) {
      console.log("✅ No unpaid bookings to cancel.");
      return;
    }

    const now = new Date();

    for (const booking of unpaidBookings) {
      const createdAt = new Date(booking.createdAt);
      const diffMinutes = (now - createdAt) / 1000 / 60;

      if (diffMinutes >= CANCEL_AFTER_MINUTES) {
        // Get the show time correctly
        const showTimeStr = booking.show?.showDateTime
          ? new Date(booking.show.showDateTime).toLocaleString()
          : booking.showTime || "Unknown Time";

        const movieTitle = booking.show?.movie?.title || "Unknown Movie";

        // Send cancellation email
        const htmlContent = generateCancellationEmail({
          userName: booking.user.name,
          movieTitle: movieTitle,
          theater: booking.theater || "Unknown Theater",
          showTime: showTimeStr
        });

        await sendEmail({
          to: booking.user.email,
          subject: "Booking Cancelled - QuickShow",
          html: htmlContent
        });

        // Delete the booking (release seats)
        await Booking.findByIdAndDelete(booking._id);
        console.log(`❌ Cancelled booking: ${booking._id} for user: ${booking.user.email}`);
      }
    }
  } catch (err) {
    console.error("❌ Error running cleanup job:", err);
  }
};

const startBookingCleanupJob = () => {
  cancelOldBookings(); // run immediately
  setInterval(cancelOldBookings, 300 * 1000); // every 5 minute
  console.log("⏱️ Booking cleanup job started (runs every 5 minute).");
};

export default startBookingCleanupJob;
