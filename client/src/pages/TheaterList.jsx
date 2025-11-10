import React, { useEffect, useState } from "react";
import axios from "axios";
import Theater from "./Theaters.jsx";
import { useParams, useSearchParams } from "react-router-dom";

export default function TheaterList() {
  const { id: movieId } = useParams(); // movieId from route
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        if (!movieId || !date) return;
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3000/api/shows/by-date?movie=${movieId}&date=${date}`
        );
        if (res.data.success) {
          setShows(res.data.shows);
        } else {
          setShows([]);
        }
      } catch (err) {
        console.error("Error fetching shows:", err);
        setShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [movieId, date]);

  if (!date)
    return (
      <div className="max-w-5xl mx-auto px-6 pt-[120px] text-center">
        <p className="text-lg mb-3">Please select a date first.</p>
      </div>
    );

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg">
        Loading available shows...
      </p>
    );

  if (shows.length === 0)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg">
        No shows found for this movie on {new Date(date).toDateString()}.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 pt-[120px] md:pt-[160px]">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Available Theaters for {new Date(date).toDateString()}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        {shows.map((show) => (
          <Theater key={show._id} show={show} movieId={movieId} date={date} />
        ))}
      </div>
    </div>
  );
}
