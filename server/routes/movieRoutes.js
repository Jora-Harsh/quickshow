import express from "express";
import { getLatestMovies } from "../controllers/showController.js";
// using showController because your movie logic is inside it

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


export default movieRouter;
