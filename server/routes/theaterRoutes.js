import express from "express";
import { getAllTheaters, getTheaterById } from "../controllers/theaterController.js";

const theaterRouter = express.Router();

// Get all theaters
theaterRouter.get("/", getAllTheaters);

// Get specific theater by ID (or name)
theaterRouter.get("/:id", getTheaterById);

export default theaterRouter;
