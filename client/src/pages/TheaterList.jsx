import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export default function TheaterList() {
  const { id: movieId } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");
  const navigate = useNavigate();

  const [groupedTheaters, setGroupedTheaters] = useState({});
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
          const shows = res.data.shows;

          // ⭐ GROUP BY THEATER
          const temp = {};

          shows.forEach((show) => {
            const theaterName = show.theater;

            if (!temp[theaterName]) {
              temp[theaterName] = [];
            }

            temp[theaterName].push(show);
          });

          setGroupedTheaters(temp);
        } else {
          setGroupedTheaters({});
        }
      } catch (err) {
        console.error("Error fetching shows:", err);
        setGroupedTheaters({});
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [movieId, date]);

  // UI loading sections
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

  const theaterNames = Object.keys(groupedTheaters);

  if (theaterNames.length === 0)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg">
        No shows found for this movie on {new Date(date).toDateString()}.
      </p>
    );

  // **************************************
  // ⭐ FINAL UI — Same design, NO NESTING
  // **************************************

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 pt-[120px] md:pt-[160px]">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Available Theaters for {new Date(date).toDateString()}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        {theaterNames.map((theaterName) => (
          <div
            key={theaterName}
            className="p-5 border border-primary/30 bg-primary/10 rounded-2xl shadow-md"
          >
            {/* THEATER NAME */}
            <h2 className="text-lg font-semibold mb-2">{theaterName}</h2>

            {/* SHOWTIMES INSIDE — NO NESTED CARDS */}
            <div className="flex flex-wrap gap-3">
              {groupedTheaters[theaterName].map((show) => {
                const showTimeFormatted = new Date(
                  show.showDateTime
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const handleClick = () => {
                  const query = new URLSearchParams();
                  query.set("theater", theaterName);
                  query.set("time", show.showDateTime);

                  navigate(`/movies/${movieId}/${date}?${query.toString()}`);
                };

                return (
                  <button
                    key={show._id}
                    onClick={handleClick}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm active:scale-95 transition"
                  >
                    {showTimeFormatted}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
