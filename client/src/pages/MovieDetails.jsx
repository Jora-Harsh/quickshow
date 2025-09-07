// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
// import BlurCircle from '../components/BlurCircle';
// import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
// import timeFormate from '../lib/timeFormate';
// import DateSelect from '../components/DateSelect';
// import MovieCard from '../components/MovieCard';
// import Loading from '../components/Loading';

// const MovieDetails = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [show, setShow] = useState(null);

//   const getShow = async () => {
//     const found = dummyShowsData.find(s => String(s._id) === String(id));
//     if (!found) return;
//     setShow({
//       movie: found,
//       dateTime: dummyDateTimeData,
//     });
//   };

//   useEffect(() => {
//     getShow();
//   }, [id]);

//   if (!show) return <Loading/>
//   const year =
//     show.movie?.release_date?.split?.('-')?.[0] ??
//     (show.movie?.release_date
//       ? new Date(show.movie.release_date).getFullYear()
//       : '');

//   return (
//     <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
//       <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
//         <img
//           src={show.movie.poster_path}
//           alt=""
//           className="max-md:mx-auto rounded-xl w-full max-w-[260px] md:max-w-[300px] object-cover"
//         />

//         <div className="relative flex flex-col gap-3">
//           <BlurCircle top="-100px" left="-100px" />
//           <p className="text-primary">ENGLISH</p>
//           <h1 className="text-4xl font-semibold max-w-96 text-balance">
//             {show.movie.title}
//           </h1>

//           <div className="flex items-center gap-2 text-gray-300">
//             <StarIcon className="w-5 h-5 text-primary fill-primary" />
//             {Number(show.movie.vote_average ?? 0).toFixed(1)} User Rating
//           </div>

//           <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
//             {show.movie.overview}
//           </p>

//           <p>
//             {timeFormate(show.movie.runtime)} •{' '}
//             {Array.isArray(show.movie.genres)
//               ? show.movie.genres.map(g => g.name).join(', ')
//               : ''}
//             {' • '} {year}
//           </p>

//           <div className="flex items-center flex-wrap gap-4 mt-4">
//             <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
//               <PlayCircleIcon className="w-5 h-5" />
//               Watch Trailer
//             </button>
//             <a
//               href="#dateSelect"
//               className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
//             >
//               Buy Tickets
//             </a>
//             <button className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
//               <Heart className="w-6 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>

//       <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
//       <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
//         <div className="flex items-center gap-4 w-max px-4">
//           {show.movie.casts.slice(0, 12).map((cast, index) => (
//             <div key={index} className="flex flex-col items-center text-center">
//               <img
//                 src={cast.profile_path}
//                 alt=""
//                 className="rounded-full h-20 md:h-20 aspect-square object-cover"
//               />
//               <p className="font-medium text-xs mt-3">{cast.name}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       <DateSelect dateTime={show.dateTime} id={id} />

//       <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>

//       {/* Responsive, even grid for cards */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-items-center">
//         {dummyShowsData.slice(0, 4).map((movie, index) => (
//           <MovieCard key={index} movie={movie} />
//         ))}
//       </div>

//       <div className="flex justify-center mt-20">
//         <button
//           onClick={() => {navigate('/movies'); scrollTo(0,0)}}
//           className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
//         >
//           Show More
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MovieDetails;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormate from '../lib/timeFormate';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const FAVORITES_KEY = "favorites";

  // get movie data from dummyShowsData
  const getShow = () => {
    const found = dummyShowsData.find(s => String(s._id) === String(id));
    if (!found) return;
    setShow({
      movie: found,
      dateTime: dummyDateTimeData,
    });
  };

  // check if this movie is already in favorites
  const checkFavoriteStatus = () => {
    if (!show) return;
    const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    const isFav = storedFavorites.some(fav => String(fav._id) === String(show.movie._id));
    setIsFavorited(isFav);
  };

  // toggle favorite
const handleFavoriteClick = () => {
  const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  if (isFavorited) {
    const updated = storedFavorites.filter(fav => String(fav._id) !== String(show.movie._id));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    setIsFavorited(false);
    toast.error("Removed from Favorites ❤️");
  } else {
    const newFav = show.movie;
    const updated = [...storedFavorites, newFav];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    setIsFavorited(true);
    toast.success("Added to Favorites ❤️");
  }
};

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (show) checkFavoriteStatus();
  }, [show]);

  if (!show) return <Loading />;

  const year = show.movie?.release_date?.split?.('-')?.[0] ??
    (show.movie?.release_date ? new Date(show.movie.release_date).getFullYear() : '');

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.movie.poster_path}
          alt=""
          className="max-md:mx-auto rounded-xl w-full max-w-[260px] md:max-w-[300px] object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {Number(show.movie.vote_average ?? 0).toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p>
            {timeFormate(show.movie.runtime)} •{' '}
            {Array.isArray(show.movie.genres)
              ? show.movie.genres.map(g => g.name).join(', ')
              : ''}
            {' • '} {year}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>
            <button
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
              onClick={handleFavoriteClick}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-6 h-5 transition-all ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={cast.profile_path}
                alt=""
                className="rounded-full h-20 md:h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-items-center">
        {dummyShowsData.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => { navigate('/movies'); scrollTo(0, 0) }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;

