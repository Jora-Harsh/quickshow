import userModel from "../models/userModel.js";

// ✅ Toggle favorite (add/remove)
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { movieId, title, poster_path } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, message: "movieId is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!Array.isArray(user.favorites)) user.favorites = [];

    const isFavorite = user.favorites.some(fav => fav.movieId === movieId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(fav => fav.movieId !== movieId);
    } else {
      user.favorites.push({
        movieId: String(movieId),
        title: title || "",
        poster_path: poster_path || "",
      });
    }

    user.markModified("favorites");
    await user.save();

    res.json({
      success: true,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get all favorites for logged-in user
export const getFavorites = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("favorites");
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
};
