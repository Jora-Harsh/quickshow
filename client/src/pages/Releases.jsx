import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const Releases = () => {
  const { axios, image_base_url } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestMovies = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/shows/latest", { withCredentials: true });
        if (data.success) setMovies(data.movies);
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Latest Releases</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.length ? movies.map(movie => (
          <div key={movie.showId} className="bg-white rounded shadow overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-2">
              <h3 className="font-semibold">{movie.title}</h3>
              <p className="text-sm">{movie.theater}</p>
              <p className="text-sm">{new Date(movie.showDateTime).toLocaleString()}</p>
              <p className="text-sm font-medium">₹{movie.showPrice}</p>
            </div>
          </div>
        )) : <p>No latest movies found.</p>}
      </div>
    </div>
  );
};

export default Releases;
