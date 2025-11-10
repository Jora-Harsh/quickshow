import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
  movie: { type: String, ref: "Movie", required: true }, // TMDB ID
  theater: { type: String, ref: "Theater", required: true }, // e.g. "th_pvr"
  showDateTime: { type: Date, required: true },
  showPrice: { type: Number, required: true },
  occupiedSeats: { type: Object, default: {} },
}, { minimize: false, timestamps: true });

const Show = mongoose.model("Show", showSchema);
export default Show;
