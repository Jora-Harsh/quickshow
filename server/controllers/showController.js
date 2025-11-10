import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// ✅ Get Now Playing Movies from TMDB
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

// ✅ Add new shows for a movie
// ✅ Add new shows for a movie
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice, theater } = req.body; // ✅ include theater

    if (!theater) {
      return res.status(400).json({
        success: false,
        message: "Theater is required",
      });
    }

    let movie = await Movie.findById(movieId);
    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
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
          theater, // ✅ add theater here
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
    console.error("❌ Error adding show:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all shows (unique movies)
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $lt: new Date() } })
      .populate("movie")
      .sort({ showDateTime: -1 });

    const uniqueMoviesMap = new Map();
    shows.forEach((show) => {
      if (show.movie) {
        const movieId = show.movie._id.toString();
        if (!uniqueMoviesMap.has(movieId)) {
          uniqueMoviesMap.set(movieId, show.movie);
        }
      }
    });

    const uniqueMovies = Array.from(uniqueMoviesMap.values());
    res.json({ success: true, shows: uniqueMovies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all upcoming shows for a single movie
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({ movie: movieId}).sort({
      showDateTime: -1,
    });

    const movie = await Movie.findById(movieId);

    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get related movies (recommendations)
export const getRelatedMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!movieId) return res.status(400).json({ success: false, message: "movieId is required" });

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: "TMDb API key not set" });

    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US`
    );

    if (!response.data || !response.data.results) {
      return res.status(404).json({ success: false, message: "No related movies found" });
    }

    res.json({ success: true, movies: response.data.results });
  } catch (err) {
    console.error("❌ Error fetching related movies:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to fetch related movies", error: err.message });
  }
};

// ✅ NEW — Get shows by movie & date
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
    });

    if (shows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No shows found for this movie and date",
        shows: [],
      });
    }

    res.status(200).json({
      success: true,
      shows,
    });
  } catch (error) {
    console.error("Error fetching shows by movie/date:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
