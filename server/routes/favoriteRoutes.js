import express from "express";
import userAuth from "../middleware/userAuth.js";
import { toggleFavorite, getFavorites } from "../controllers/favoriteController.js";

const router = express.Router();

// Toggle favorite (add/remove)
router.post("/toggle", userAuth, toggleFavorite);

// Get favorites for current user
router.get("/", userAuth, getFavorites);

export default router;
