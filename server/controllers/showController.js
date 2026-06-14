import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// Helper for fetching from TMDB with retries to resolve transient TLS issues
const tmdbGet = async (url) => {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      });
      return response;
    } catch (err) {
      lastErr = err;
      console.log(`⚠️ TMDB call to ${url} failed (attempt ${i + 1}/3): ${err.message}`);
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
  }
  throw lastErr;
};

/* =========================================================
   1️⃣ GET NOW PLAYING MOVIES (from TMDB)
========================================================= */
export const getNowPlayingMovies = async (req, res) => {
  console.log("➡️ Received request for GET /api/shows/now-playing");
  try {
    const url =
      "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";

    console.log(`🌐 Initiating TMDB API call to: ${url}`);
    console.log("🔑 TMDB_API_KEY length:", process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.length : 0);

    let data;
    try {
      const response = await tmdbGet(url);
      data = response.data;
      console.log(`✅ TMDB now_playing call succeeded. Received ${data.results?.length} movies.`);
    } catch (firstErr) {
      console.log(`⚠️ now_playing failed permanently after retries. Trying Popular movies fallback...`);
      const urlPopular = "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
      const response = await tmdbGet(urlPopular);
      data = response.data;
      console.log(`✅ TMDB popular fallback succeeded. Received ${data.results?.length} movies.`);
    }

    res.json({ success: true, movies: data.results });
  } catch (err) {
    console.log("❌ TMDB now_playing and popular fallback failed.");
    console.log("Error status code:", err.response?.status);
    console.log("Error data:", err.response?.data);
    console.log("Error message:", err.message);
    console.log("Error stack:", err.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch movies",
      errorDetails: err.response?.data || err.message 
    });
  }
};


/* =========================================================
   2️⃣ ADD SHOWS FOR A MOVIE (Admin)
========================================================= */

export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice, theater } = req.body;

    // Basic validation
    if (!movieId || !showsInput || !showPrice || !theater) {
      return res.status(400).json({
        success: false,
        message: "movieId, showsInput, showPrice, and theater are required",
      });
    }

    // 1️⃣ Try fetching movie from DB
    let movie = await Movie.findById(movieId);

    // 2️⃣ If movie does NOT exist → fetch from TMDB + save
    if (!movie) {
      try {
        const [movieDetailsRes, creditsRes] = await Promise.all([
          tmdbGet(`https://api.themoviedb.org/3/movie/${movieId}`),
          tmdbGet(`https://api.themoviedb.org/3/movie/${movieId}/credits`),
        ]);

        const d = movieDetailsRes.data;

        movie = await Movie.create({
          _id: movieId,
          title: d.title,
          overview: d.overview,
          poster_path: d.poster_path,
          backdrop_path: d.backdrop_path,
          release_date: d.release_date,
          original_language: d.original_language,
          tagline: d.tagline || "",
          genres: d.genres,
          casts: creditsRes.data.cast || [],
          runtime: d.runtime,
          vote_average: d.vote_average,
        });
      } catch (err) {
        console.error("TMDB fetch failed:", err.message);
        return res
          .status(404)
          .json({ success: false, message: "Movie not found on TMDB" });
      }
    }

    // 3️⃣ Release date validation
    const releaseDate = new Date(movie.release_date);

    const showsToCreate = [];

    showsInput.forEach(({ date, time }) => {
      time.forEach((t) => {
        const dt = new Date(`${date}T${t}`);

        if (dt < releaseDate) {
          return res.status(400).json({
            success: false,
            message: `Show cannot be before release date (${movie.release_date})`,
          });
        }

        showsToCreate.push({
          movie: movieId,
          theater,
          showDateTime: dt,
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    // 4️⃣ Insert all show entries at once
    await Show.insertMany(showsToCreate);

    res.json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error("❌ Error adding show:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   3️⃣ GET ALL SHOWS → UNIQUE MOVIES LIST
========================================================= */
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find().populate("movie");

    const map = new Map();

    shows.forEach((show) => {
      if (show.movie) {
        map.set(show.movie._id.toString(), show.movie);
      }
    });

    res.json({ success: true, shows: [...map.values()] });
  } catch (error) {
    console.error("❌ Error in getAllShows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllShowsGrouped = async (req, res) => {
  try {
    const shows = await Show.find().populate("movie");

    // Group by movie
    const grouped = {};

    shows.forEach((show) => {
      const movieId = show.movie?._id?.toString();
      if (!movieId) return;

      if (!grouped[movieId]) {
        grouped[movieId] = {
          movie: show.movie,
          shows: []
        };
      }

      grouped[movieId].shows.push({
        showId: show._id,
        time: show.showDateTime,
        theater: show.theater,
        price: show.showPrice
      });
    });

    res.json({
      success: true,
      shows: Object.values(grouped)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================================================
   4️⃣ GET ALL UPCOMING SHOWS FOR A MOVIE
========================================================= */
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    const shows = await Show.find({ movie: movieId }).sort({
      showDateTime: 1,
    });

    const grouped = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];

      if (!grouped[date]) grouped[date] = [];

      grouped[date].push({
        showId: show._id,
        time: show.showDateTime,
        theater: show.theater,
        price: show.showPrice,
      });
    });

    res.json({ success: true, movie, dateTime: grouped });
  } catch (error) {
    console.error("❌ Error in getShow:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   5️⃣ GET RELATED MOVIES (TMDB)
========================================================= */
export const getRelatedMovies = async (req, res) => {
  console.log(`➡️ Received request for GET /api/shows/${req.params.movieId}/related`);
  try {
    const { movieId } = req.params;

    if (!movieId) {
      console.log("⚠️ Missing movieId parameter");
      return res
        .status(400)
        .json({ success: false, message: "movieId required" });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.log("⚠️ TMDB_API_KEY is not configured");
      return res.status(500).json({
        success: false,
        message: "TMDb API key not configured",
      });
    }

    let results = [];
    const urlRecommendations = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?language=en-US`;
    console.log(`🌐 Trying TMDB Recommendations API: ${urlRecommendations}`);

    try {
      const response = await tmdbGet(urlRecommendations);
      results = response.data.results || [];
      console.log(`✅ TMDB Recommendations call succeeded. Received ${results.length} movies.`);
    } catch (recErr) {
      console.log(`⚠️ Recommendations failed (${recErr.message}). Falling back to TMDB Similar movies...`);
      const urlSimilar = `https://api.themoviedb.org/3/movie/${movieId}/similar?language=en-US`;
      console.log(`🌐 Trying TMDB Similar API: ${urlSimilar}`);
      
      const response = await tmdbGet(urlSimilar);
      results = response.data.results || [];
      console.log(`✅ TMDB Similar call succeeded. Received ${results.length} movies.`);
    }

    res.json({ success: true, movies: results });
  } catch (err) {
    console.log("❌ Related movies request failed.");
    console.log("Error status code:", err.response?.status);
    console.log("Error data:", err.response?.data);
    console.log("Error message:", err.message);
    console.log("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related movies",
      errorDetails: err.response?.data || err.message,
    });
  }
};



/* =========================================================
   6️⃣ GET SHOWS BY MOVIE + DATE (For TheaterList)
========================================================= */
export const getShowsByMovieAndDate = async (req, res) => {
  try {
    const { movie, date } = req.query;

    if (!movie || !date) {
      return res.status(400).json({
        success: false,
        message: "movie & date are required",
      });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const shows = await Show.find({
      movie,
      showDateTime: { $gte: start, $lte: end },
    }).populate("movie");

    res.json({ success: true, shows });
  } catch (error) {
    console.error("❌ Error fetching shows:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================================================
   7️⃣ GET LATEST MOVIES ADDED BY ADMIN (Releases Page)
========================================================= */
export const getLatestMovies = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 7;

    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, movies });
  } catch (err) {
    console.error("❌ Error fetching latest movies:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId).populate("movie"); // just added populatemovie
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }
    res.json({ success: true, show });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// export const updateShow = async (req, res) => {
//   try {
//     const { showDateTime, showPrice, theater } = req.body;

//     const updated = await Show.findByIdAndUpdate(
//       req.params.showId,
//       { showDateTime, showPrice, theater },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ success: false, message: "Show not found" });
//     }

//     return res.json({ success: true, message: "Show updated successfully", updated });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: "Update failed" });
//   }
// };


// export const deleteShow = async (req, res) => {
//   try {
//     const deleted = await Show.findByIdAndDelete(req.params.showId);
    
//     if (!deleted) {
//       return res.status(404).json({ success: false, message: "Show not found" });
//     }

//     res.json({ success: true, message: "Show deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Delete failed" });
//   }
// };

export const updateShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const { showDateTime, showPrice, theater } = req.body;

    const updatedShow = await Show.findByIdAndUpdate(
      showId,
      { showDateTime, showPrice, theater },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    res.json({ success: true, show: updatedShow });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const deletedShow = await Show.findByIdAndDelete(showId);

    if (!deletedShow) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    res.json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getShowsForAdmin = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({ movie: movieId }).sort({ showDateTime: 1 });

    res.json({ success: true, shows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch movie shows" });
  }
};
