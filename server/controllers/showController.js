// server/controllers/showController.js
import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

export const getNowPlayingMovies = async (req, res) => {
    try {
        const url = "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";

        const { data } = await axios.get(url, {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`, // your v4 token here
            },
        });

        res.json({ success: true, movies: data.results });
    } catch (err) {
        console.error("TMDB Error:", err.response?.data || err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// API to add a new show to the database
export const addShow = async (req, res) => {
    // Implementation for adding a new show
    try {

        const { movieId, showsInput, showPrice } = req.body;
        let movie = await Movie.findById(movieId);
        if (!movie) {
            //Fetch movie details from TMDB
            const [movieDetailsResponse, moviecreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }, // your v4 token here
                }),

            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }, // your v4 token here
                }),
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = moviecreditsResponse.data;

            const movieDetails ={
                _id:movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,  
                backdrop_path: movieApiData.backdrop_path,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                genres: movieApiData.genres,
                casts: movieCreditsData.cast ,
                runtime: movieApiData.runtime,
                vote_average: movieApiData.vote_average
            }

            // Save movie to DB
            movie = await Movie.create(movieDetails);
        }

            const showsToCreate = [];
            showsInput.forEach(show => {
                const showDate = show.date;
                show.time.forEach((time) => {
                    const dateTimeString =`${showDate}T${time}`;
                    showsToCreate.push({
                        movie: movieId,
                        showDateTime : new Date(dateTimeString),
                        showPrice,
                        occupiedSeats: {}
                    })
                })
            });

            if(showsToCreate.length > 0){
                await Show.insertMany(showsToCreate);
            }
            res.json({ success: true, message: "Shows added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}