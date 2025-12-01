import express from "express";
import { getLatestMovies } from "../controllers/showController.js";
// using showController because your movie logic is inside it
import Movie from "../models/Movie.js";
const movieRouter = express.Router();

// Latest movies route
movieRouter.get("/latest", getLatestMovies);
// Get all movies saved in DB (added by Admin)

movieRouter.get("/all", async (req, res) => {

try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ success: true, movies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

movieRouter.get("/search", async (req, res) => {
  try {
    const query = req.query.query || "";

    if (!query.trim()) {
      return res.json({ success: true, movies: [] });
    }

    const movies = await Movie.find({
      title: { $regex: query, $options: "i" }
    }).limit(10);

    res.json({ success: true, movies });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default movieRouter;
