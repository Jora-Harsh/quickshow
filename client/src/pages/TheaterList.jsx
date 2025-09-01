// pages/TheaterList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { dummyTheaters, dummyDateTimeData } from "../assets/assets";

export default function TheaterList() {
  const { id: movieId } = useParams();
  const [sp] = useSearchParams();
  const date = sp.get("date");
  const theaterFromQuery = sp.get("theater");
  const saved = sessionStorage.getItem("selectedTheaterId");
  const theaterId = theaterFromQuery || saved || null;

  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);

  const showtimes = useMemo(
    () => (dummyDateTimeData?.[date] || []).map(x => x.time), // ISO strings
    [date]
  );

  useEffect(() => {
    const base = theaterId
      ? dummyTheaters.filter(t => t.id === theaterId)
      : dummyTheaters;

    setTheaters(base.map(t => ({ ...t, showtimes })));
  }, [theaterId, showtimes]);

const goToSeats = (isoTime, tid) => {
 
  const q = new URLSearchParams();
  q.set("theater", tid);
  q.set("time", isoTime);
  navigate(`/movies/${movieId}/${date}?${q.toString()}`);
  // navigate(`/movies/${movieId}/theaters?${q.toString()}`);
  // navigate(`/seatlayout/${movieId}/${tid}?${q.toString()}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  
  if (!date) {
    return (
      <div className="max-w-5xl mx-auto px-6 pt-[120px]">
        <p className="text-sm">No date selected.</p>
        <Link to={`/movies/${movieId}#dateSelect`} className="text-primary underline">
          Choose a date
        </Link>
      </div>
    );
  }

  const prettyDate = new Date(date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  const fmt = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? String(iso) : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 pt-[120px] md:pt-[160px]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">
          {theaterId ? "Select a Showtime" : "Select a Theater"}
        </h1>
        <span className="text-sm opacity-75">{prettyDate}</span>
      </div>

      {theaterId && (
        <div className="text-sm mb-3">
          Showing shows for{" "}
          <span className="font-semibold">
            {dummyTheaters.find(t => t.id === theaterId)?.name || "Selected Theater"}
          </span>.{" "}
          <button
            className="underline text-primary"
            onClick={() => {
              sessionStorage.removeItem("selectedTheaterId");
               navigate(`/movies/${movieId}/theaters?date=${encodeURIComponent(date)} `);
            }}
          >
            Change theater
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {theaters.map((t) => (
          <article key={t.id} className="rounded-2xl p-4 border border-primary/20 bg-primary/10">
            <h2 className="text-lg font-bold">{t.name}</h2>
            <p className="text-sm opacity-70">{t.address}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {t.showtimes.length ? t.showtimes.map((iso) => (
                <button
                  key={`${t.id}-${iso}`}
                  onClick={() => goToSeats(iso, t.id)}
                  className="px-3 py-1 rounded-full bg-primary hover:bg-primary/90 text-white text-sm active:scale-95 transition"
                >
                  {fmt(iso)}
                </button>
              )) : (
                <span className="text-xs opacity-70">No shows today</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
