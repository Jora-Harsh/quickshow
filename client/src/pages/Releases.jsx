import { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";

export default function Releases() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestMovies = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/shows/latest", { withCredentials: true });
        setMovies(res.data.movies || []);
      } catch (error) {
        console.error("Error fetching latest movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMovies();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 pt-[120px] md:pt-[160px]">
      <h1 className="text-3xl font-bold mb-6 text-white">🎬 Latest Releases</h1>

      {movies.length === 0 ? (
        <p className="text-center text-gray-400">No movies have been added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
