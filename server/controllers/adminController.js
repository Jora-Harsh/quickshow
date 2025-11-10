import Show from "../models/Show.js";
import Booking from "../models/Bookings.js";
import User from "../models/userModel.js";
import Movie from "../models/Movie.js";
import axios from "axios";

// ✅ Check admin
export const isAdmin = (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// ✅ Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const shows = await Show.find().populate("movie");
    const bookings = await Booking.find();
    const users = await User.find();

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue,
      totalUser: users.length,
      activeShows: shows,
    };

    return res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

// ✅ Get all shows (no date filter)
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    console.error("getAllShows error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Add new shows (with theater support)
export const addShow = async (req, res) => {
  try {
    console.log("🟢 Received show add request:", req.body); 
    const { movieId, showsInput, showPrice, theater } = req.body;

    if (!theater || theater === "N/A") {
      return res.status(400).json({
        success: false,
        message: "Please select a valid theater.",
      });
    }

    let movie = await Movie.findById(movieId);
    if (!movie) {
      // Fetch from TMDB if not found
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
      ]);

      const movieDetails = movieDetailsResponse.data;
      const movieCredits = movieCreditsResponse.data;

      movie = await Movie.create({
        _id: movieId,
        title: movieDetails.title,
        overview: movieDetails.overview,
        poster_path: movieDetails.poster_path,
        backdrop_path: movieDetails.backdrop_path,
        release_date: movieDetails.release_date,
        original_language: movieDetails.original_language,
        tagline: movieDetails.tagline || "",
        genres: movieDetails.genres,
        casts: movieCredits.cast,
        runtime: movieDetails.runtime,
        vote_average: movieDetails.vote_average,
      });
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          theater, // ✅ Selected theater
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Shows added successfully." });
  } catch (error) {
    console.error("❌ Error adding show:", error);
    res.status(500).json({ success: false, message: "Failed to add show." });
  }
};
