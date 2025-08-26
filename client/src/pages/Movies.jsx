import React from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <div className="relative my-40 mb-60 px-4 md:px-16 lg:px-32 xl:px-44 overflow-hidden min-h-[80vh]">

      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="150px" right="0px" />
      <h1 className="text-lg font-medium my-4 text-white">Now Showing</h1>
      <div className="grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
   <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No Movies Available</h1>
    </div>
  );
};

export default Movies;
