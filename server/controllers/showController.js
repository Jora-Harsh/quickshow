import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

/* =========================================================
   1️⃣ GET NOW PLAYING MOVIES (from TMDB)
========================================================= */
export const getNowPlayingMovies = async (req, res) => {
  try {
    const url = "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";

    const { data } = await axios.get(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    });

    res.json({ success: true, movies: data.results });
  } catch (err) {
    console.error("TMDB Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   2️⃣ ADD SHOWS FOR A MOVIE
========================================================= */
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice, theater } = req.body;

    if (!movieId || !showsInput || !showPrice || !theater) {
      return res.status(400).json({
        success: false,
        message: "movieId, showsInput, showPrice, and theater are required",
      });
    }

    // Check if movie exists in DB, if not → fetch from TMDB
    let movie = await Movie.findById(movieId);
    if (!movie) {
      const [movieDetailsRes, movieCreditsRes] = await Promise.all([
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

      const details = movieDetailsRes.data;
      const credits = movieCreditsRes.data;

      movie = await Movie.create({
        _id: movieId,
        title: details.title,
        overview: details.overview,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        release_date: details.release_date,
        original_language: details.original_language,
        tagline: details.tagline || "",
        genres: details.genres,
        casts: credits.cast,
        runtime: details.runtime,
        vote_average: details.vote_average,
      });
    }

    // Prepare show documents
    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          theater,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error("❌ Error adding show:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   3️⃣ GET ALL SHOWS (Unique Movies Only)
========================================================= */
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMoviesMap = new Map();

    shows.forEach((show) => {
      if (show.movie && show.movie._id) {
        const movieId = show.movie._id.toString();
        if (!uniqueMoviesMap.has(movieId)) {
          uniqueMoviesMap.set(movieId, show.movie);
        }
      }
    });

    const uniqueMovies = Array.from(uniqueMoviesMap.values());
    res.json({ success: true, shows: uniqueMovies });
  } catch (error) {
    console.error("❌ Error in getAllShows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   4️⃣ GET ALL UPCOMING SHOWS FOR A SINGLE MOVIE
========================================================= */
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({ movie: movieId }).sort({
      showDateTime: 1,
    });

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        price: show.showPrice,
        theater: show.theater,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("❌ Error in getShow:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   5️⃣ GET RELATED MOVIES (Recommendations)
========================================================= */
export const getRelatedMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      return res.status(400).json({ success: false, message: "movieId is required" });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "TMDb API key not configured" });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US`
    );

    res.json({ success: true, movies: response.data.results || [] });
  } catch (err) {
    console.error("❌ Error fetching related movies:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related movies",
      error: err.message,
    });
  }
};

/* =========================================================
   6️⃣ GET SHOWS BY MOVIE AND DATE
========================================================= */
export const getShowsByMovieAndDate = async (req, res) => {
  try {
    const { movie, date } = req.query;

    if (!movie || !date) {
      return res.status(400).json({
        success: false,
        message: "Movie ID and date are required",
      });
    }

    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const shows = await Show.find({
      movie,
      showDateTime: { $gte: startOfDay, $lte: endOfDay },
    }).populate("movie");

    res.json({
      success: true,
      shows,
    });
  } catch (error) {
    console.error("❌ Error fetching shows by movie/date:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
