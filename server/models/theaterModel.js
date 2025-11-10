import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // example: "INOX", "PVR", "Carnival"
  },
  location: {
    type: String,
    required: true,
  },
  seatLayout: {
    rows: {
      type: [[String]], // Example: [["A","B","C"], ["D","E","F"]]
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
  },
}, { timestamps: true });

const Theater = mongoose.model("Theater", theaterSchema);
export default Theater;
