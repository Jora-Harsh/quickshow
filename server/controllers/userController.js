
import path from "path";
import fs from "fs";
import multer from "multer";
import userModel from "../models/userModel.js";
import Booking from "../models/Bookings.js";
import Movie from "../models/Movie.js";

// ---------------------
// Multer configuration (in-memory)
// ---------------------
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// ---------------------
// Controller: Get user data
// ---------------------
export const getUsersData = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------
// Controller: Upload / update profile picture
// ---------------------
export const uploadProfilePic = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Profile picture upload is temporarily disabled in production."
  });
};



// api controller function to get user booking

export const getUserBookings = async (req, res) => {
  try {
      const user  = req.auth().userId;
      const bookings = await Booking.find({user}).populate({
        path: 'show',
        populate: { path: 'movie' }
      }).sort({ createdAt: -1 });
      res.json({ success: true, bookings });
  } catch (error) {
      console.error("getUserBookings error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
}

// ---------------------
// Add favorite movie
// ---------------------
export const addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.userId; // ✅ comes from your JWT middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Avoid duplicate favorites
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }

    res.json({ success: true, message: "Movie added to favorites", favorites: user.favorites });
  } catch (error) {
    console.error("addFavorite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------
// Remove favorite movie (optional)
// ---------------------
export const removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== movieId);
    await user.save();

    res.json({ success: true, message: "Movie removed from favorites", favorites: user.favorites });
  } catch (error) {
    console.error("removeFavorite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------
// Get user's favorite movies
// ---------------------
export const getFavorites = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    const user = await userModel.findById(req.userId).populate("favorites");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, movies: user.favorites });
  } catch (err) {
    console.error("Get favorites error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
