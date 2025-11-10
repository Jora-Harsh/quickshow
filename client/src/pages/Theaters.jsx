import React from "react";
import { useNavigate } from "react-router-dom";

export default function Theater({ show, movieId, date }) {
  const navigate = useNavigate();

  const showTime = new Date(show.showDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const goToSeats = () => {
    const query = new URLSearchParams();
    query.set("theater", show.theater || "defaultTheater");
    query.set("time", show.showDateTime);
    navigate(`/movies/${movieId}/${date}?${query.toString()}`);
  };

  return (
    <div className="p-5 border border-primary/30 bg-primary/10 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-1">
        Theater: {show.theater || "N/A"}
      </h2>
      <p className="text-sm text-gray-700 mb-2">
        Show Time: <span className="font-medium">{showTime}</span>
      </p>
      <p className="text-sm text-gray-700 mb-4">
        Price: <span className="font-medium">₹{show.showPrice}</span>
      </p>

      <button
        onClick={goToSeats}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm active:scale-95 transition"
      >
        Book Now
      </button>
    </div>
  );
}
