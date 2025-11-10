import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import timeFormate from "../lib/timeFormate";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [youMayLike, setYouMayLike] = useState([]);

  // Fetch movie details
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/shows/${id}`, { withCredentials: true });
      if (data.success && data.movie) setShow({ movie: data.movie, dateTime: data.dateTime || [] });
      else toast.error("Movie not found");
    } catch (error) {
      console.error("❌ Error fetching show:", error);
      toast.error("Failed to load movie details");
    }
  };

  // Check favorite status
  const checkFavoriteStatus = async () => {
    try {
      const res = await axios.get("/api/favorites", { withCredentials: true });
      if (res.data.success && Array.isArray(res.data.favorites)) {
        const favs = res.data.favorites;
        const movieId = String(show.movie._id);
        const isFav = favs.some(f => (f.movieId || f._id || f.id || f) === movieId);
        setIsFavorited(isFav);
      }
    } catch (err) {
      console.error("❌ Error checking favorites:", err);
    }
  };

  // Toggle favorite
  const handleFavoriteClick = async () => {
    if (!show?.movie) return toast.error("Movie data not found");
    const movieId = show.movie._id;
    try {
      const { data } = await axios.post("/api/favorites/toggle", {
        movieId,
        title: show.movie.title,
        poster_path: show.movie.poster_path,
      }, { withCredentials: true });

      if (data.success) {
        setIsFavorited(prev => !prev);
        toast.success(data.message || "Updated favorites");
      } else toast.error(data.message);
    } catch (err) {
      console.error("❌ Favorite API error:", err);
      toast.error("Failed to toggle favorite");
    }
  };

  // Fetch "You May Like"
  const fetchYouMayLike = async () => {
    try {
      const { data } = await axios.get(`/api/shows/${id}/you-may-like`, { withCredentials: true });
      if (data.success) setYouMayLike(data.movies);
    } catch (err) {
      console.error("❌ Error fetching You May Like movies:", err);
    }
  };

  useEffect(() => { getShow(); }, [id]);
  useEffect(() => { if (show?.movie) checkFavoriteStatus(); }, [show]);
  useEffect(() => { if (show?.movie) fetchYouMayLike(); }, [show]);

  if (!show) return <Loading />;

  const year = show.movie.release_date?.split?.("-")?.[0] || new Date(show.movie.release_date).getFullYear();

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      {/* Movie Details */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img src={`https://image.tmdb.org/t/p/w500${show.movie.poster_path}`} alt={show.movie.title} className="max-md:mx-auto rounded-xl w-full max-w-[260px] md:max-w-[300px] object-cover"/>
        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary uppercase">{show.movie.original_language}</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">{show.movie.title}</h1>
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary"/>
            {Number(show.movie.vote_average ?? 0).toFixed(1)} User Rating
          </div>
          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">{show.movie.overview}</p>
          <p>{timeFormate(show.movie.runtime)} • {show.movie.genres?.map(g => g.name).join(", ")} • {year}</p>
          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium active:scale-95">
              <PlayCircleIcon className="w-5 h-5"/> Watch Trailer
            </button>
            <a href="#dateSelect" className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium active:scale-95">Buy Tickets</a>
            <button className="bg-gray-700 p-2.5 rounded-full transition active:scale-95" onClick={handleFavoriteClick} title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
              <Heart className={`w-6 h-5 transition-all ${isFavorited ? "text-red-500 fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Cast */}
      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts?.length > 0 ? show.movie.casts.slice(0,12).map((cast,index)=>(
            <div key={index} className="flex flex-col items-center text-center">
              <img src={cast.profile_path ? `https://image.tmdb.org/t/p/w200${cast.profile_path}` : "/no-image.jpg"} alt={cast.name} className="rounded-full h-20 md:h-20 aspect-square object-cover"/>
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          )) : <p className="text-gray-400 text-sm">No cast information available</p>}
        </div>
      </div>

      {/* Date Selection */}
      <DateSelect dateTime={show.dateTime} id={id} />

      {/* You May Like */}
      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
        {youMayLike.length > 0
          ? youMayLike.map(movie => <MovieCard key={movie._id} movie={movie} />)
          : <p className="text-gray-400 text-sm">No recommendations available.</p>}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-20">
        <button onClick={() => { navigate("/movies"); scrollTo(0,0); }} className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium">
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
