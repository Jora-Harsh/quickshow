import express from "express";
import {
  addShow,
  getAllShows,
  getNowPlayingMovies,
  getShow,
  getRelatedMovies,
  getShowsByMovieAndDate,
  getLatestMovies, // ✅ imported
} from "../controllers/showController.js";

const showRouter = express.Router();

showRouter.get("/now-playing", getNowPlayingMovies);
showRouter.post("/add", addShow);
showRouter.get("/all", getAllShows);
showRouter.get("/by-date", getShowsByMovieAndDate); // ✅ new route
showRouter.get("/:movieId", getShow);
showRouter.get("/:movieId/related", getRelatedMovies);
// showRouter.get("/latest", getLatestMovies);

export default showRouter;
