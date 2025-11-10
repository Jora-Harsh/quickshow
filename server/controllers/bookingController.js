// Function to check availability of selected seats for a movie

import Show from "../models/Show.js"

const checkSeatAvailability = async (showId, selectedSeats) => {
    try {
       const showData = await Show.findById(showId);
       if (!showData) return false;

         const occupiedSeats = showData.occupiedSeats;

         const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
         return !isAnySeatTaken;
    } catch (error) {
        console.error("Error checking seat availability:", error);
        return false;
    }

}

export const createBooking = async (req, res) => {
    try {
        const {userId} = req.auth();
        const  {showId, selectedSeats} = req.body;
        const {origin} = req.headers;

        // Check if seats are available
        const isAvailable = await checkSeatAvailability(showId, selectedSeats);
        if (!isAvailable) {
            return res.status(400).json({ success: false, message: "One or more selected seats are already booked." });
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        //Create a new booking
        const booking = await Booking.create({

            user: userId,
            show: showId,
            amount: showData.price * selectedSeats.length,
            bookedSeats: selectedSeats

        })

        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');
        await showData.save();


        // Stripe Gateway Initialize

        res.json({ success: true, message: "Booking created successfully"  });
    } catch (error) {
        console.error("createBooking error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const {showId} = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        res.json({ success: true, occupiedSeats } );
    }
    catch (error) {
        console.error("getOccupiedSeats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }   
}