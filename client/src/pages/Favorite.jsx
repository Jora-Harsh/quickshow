import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";

const Favourite = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="text-6xl text-pink-500 animate-bounce mb-4">❤️</div>
        <h2 className="text-2xl font-semibold text-pink-400 mb-2">
          No favourites yet
        </h2>
        <p className="text-gray-400 mb-6">
          Start adding movies you love and they’ll appear here.
        </p>
        <button
          onClick={() => navigate("/movies")}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium shadow-lg hover:scale-105 transition transform"
        >
          Browse Movies
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-20">
      <h1 className="text-3xl font-semibold mb-8">
        Your Favourites
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favorites.map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Favourite;
