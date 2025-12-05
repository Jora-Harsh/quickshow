import express from "express";
import {
  addShow,
  getAllShows,
  getNowPlayingMovies,
  getShow,
  getRelatedMovies,
  getShowsByMovieAndDate,
  getLatestMovies,
  getShowById,
  updateShow,
  deleteShow,
  getShowsForAdmin,
  getAllShowsGrouped, 
} from "../controllers/showController.js";

const showRouter = express.Router();

showRouter.get("/now-playing", getNowPlayingMovies);
showRouter.post("/add", addShow);
showRouter.get("/all", getAllShows);
showRouter.get("/all-grouped", getAllShowsGrouped); 
showRouter.get("/by-date", getShowsByMovieAndDate); //
showRouter.get("/:movieId", getShow);
showRouter.get("/:movieId/related", getRelatedMovies);
// showRouter.get("/latest", getLatestMovies);
showRouter.get("/by-id/:showId", getShowById);
showRouter.put("/update/:showId", updateShow);
showRouter.delete("/delete/:showId", deleteShow);
showRouter.get("/movie/:movieId/shows", getShowsForAdmin);


export default showRouter;
