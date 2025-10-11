import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { StarIcon } from "lucide-react";
import timeFormate from "../lib/timeFormate";

export default function ComingSoonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie;

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <p className="text-lg font-medium">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-32 pb-20 flex justify-center">
      <div className="w-full max-w-sm bg-[#121212] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Movie Poster */}
        <img
          src={movie.backdrop_path}
          alt={movie.title}
          className="w-full object-cover object-center aspect-[16/9]"
        />

        {/* Movie Info */}
        <div className="p-5 flex flex-col items-center">
          <h1 className="text-xl font-bold mb-1 text-center truncate">
            {movie.title}
          </h1>

          <p className="text-gray-400 text-xs mb-2 text-center">
            Release: {new Date(movie.release_date).toDateString()} •{" "}
            {Array.isArray(movie.genres)
              ? movie.genres.slice(0, 2).map((g) => g.name).join(" | ")
              : ""}{" "}
            • {timeFormate(movie.runtime)}
          </p>

          <p className="flex items-center gap-1 text-yellow-400 mb-3 text-sm">
            <StarIcon className="w-4 h-4" />
            {(movie.vote_average ?? 0).toFixed(1)}
          </p>

          <p className="text-gray-300 text-center mb-4 text-sm">
            Tickets will be available after the movie release.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition shadow-md hover:shadow-lg text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
