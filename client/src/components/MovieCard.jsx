import { StarIcon } from 'lucide-react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import timeFormate from '../lib/timeFormate';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const goToMovie = () => {
    navigate({ pathname: `/movies/${movie._id}`, search });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
  //  <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-xl hover:translate-y-1 transition duration-300 w-full sm:max-w-[200px]">
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-xl hover:translate-y-1 transition duration-300 w-[90%] max-w-[220px] mx-auto sm:w-full sm:max-w-[200px]">

      <img
        onClick={goToMovie}
        src={movie.backdrop_path}
        alt={movie.title}
        className="rounded-lg w-full object-cover object-center cursor-pointer aspect-[2/2.6]" 
        // 👆 wider + shorter than original
      />

      <p className="font-semibold mt-2 text-sm sm:text-base truncate">
        {movie.title}
      </p>

      <p className="text-xs text-gray-400 mt-1 truncate">
        {new Date(movie.release_date).getFullYear()} •{' '}
        {Array.isArray(movie.genres)
          ? movie.genres.slice(0, 2).map((g) => g.name).join(' | ')
          : ''}{' '}
        • {timeFormate(movie.runtime)}
      </p>

      <div className="flex items-center justify-between mt-3 pb-2 gap-2">
        <button
          onClick={goToMovie}
          className="px-3 py-1.5 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Tickets
        </button>

        <p className="flex items-center gap-1 text-xs text-gray-400">
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {(movie.vote_average ?? 0).toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
