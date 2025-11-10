import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Favorites() {
  const { favoritesMovies } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="favorites-page px-6 md:px-16 lg:px-40 pt-20">
      <h2 className="text-2xl font-semibold mb-6">Your Favorites ❤️</h2>
      <div className="movie-list grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {favoritesMovies.length > 0 ? (
          favoritesMovies.map((movie) => (
            <div
              key={movie.movieId}
              className="movie-card cursor-pointer"
              onClick={() => navigate(`/movies/${movie.movieId}`)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-lg object-cover"
              />
              <h4 className="mt-2 text-sm font-medium truncate">{movie.title}</h4>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No favorites yet.</p>
        )}
      </div>
    </div>
  );
}
