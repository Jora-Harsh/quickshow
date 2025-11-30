import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";

const Releases = () => {
  const { axios } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestMovies = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/movies/latest?limit=3"
        );

        if (data.success) {
          setMovies(data.movies);
        }
      } catch (err) {
        console.error("Error fetching latest movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMovies();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="relative my-40 mb-60 px-4 md:px-16 lg:px-32 xl:px-44 min-h-[80vh]">

      <h1 className="text-lg font-medium my-4 text-white">Latest Releases</h1>

      <div className="grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))
        ) : (
          <p className="text-white text-lg">No latest movies found.</p>
        )}
      </div>
    </div>
  );
};

export default Releases;
