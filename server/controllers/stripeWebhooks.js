import Stripe from "stripe";
import Booking from "../models/Bookings.js";

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`❌ Webhook signature verification failed.`, err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (key) {
            case "payment_intent.succeeded":
                {
                    const paymentIntent = event.data.object;
                    const sessionList = await stripeInstance.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                    });
                    const session = sessionList.data[0];
                    const { bookingId } = session.metadata;

                    await Booking.findByIdAndUpdate(bookingId, {
                        isPaid: true,
                        paymentLink: ""
                    })

                    break;
                }


            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        response.status(200).json({ received: true });
    } catch (error) {
        console.error("❌ Error handling webhook event:", error);
        response.status(500).send("Internal Server Error");
    }
}