import React, { useMemo, useState } from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";

const PAST_WINDOW_DAYS = 365;   // show titles released in the last year
const FUTURE_WINDOW_DAYS = 365; // show titles releasing in the next year

const daysBetween = (a, b) => Math.round((a - b) / (1000 * 60 * 60 * 24));

const parseReleaseDate = (m) => {
  const raw = m.release_date || m.releaseDate || m.first_air_date;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

export default function Releases() {
  const [tab, setTab] = useState("now"); // "now" | "soon"

  const { nowPlaying, comingSoon } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const withDate = (dummyShowsData || []).map((m) => ({
      ...m,
      _rd: parseReleaseDate(m),
    }));

    let now = withDate.filter(
      (m) =>
        m._rd &&
        m._rd <= today &&
        daysBetween(today, m._rd) <= PAST_WINDOW_DAYS
    );

    let soon = withDate.filter(
      (m) =>
        m._rd &&
        m._rd > today &&
        daysBetween(m._rd, today) <= FUTURE_WINDOW_DAYS
    );

    // Fallback: if nothing fits the windows, just show everything as "now"
    if (!now.length && !soon.length) {
      now = [...withDate];
    }

    now.sort((a, b) => (b._rd?.getTime() ?? 0) - (a._rd?.getTime() ?? 0)); // latest first
    soon.sort((a, b) => (a._rd?.getTime() ?? Infinity) - (b._rd?.getTime() ?? Infinity)); // nearest first

    return { nowPlaying: now, comingSoon: soon };
  }, []);

  const list = tab === "now" ? nowPlaying : comingSoon;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 pt-[120px] md:pt-[160px]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Releases</h1>

        <div className="inline-flex rounded-full overflow-hidden border border-white/10">
          <button
            onClick={() => setTab("now")}
            className={`px-4 py-2 text-sm ${
              tab === "now" ? "bg-primary text-white" : "bg-transparent"
            }`}
          >
            New & In Theaters
          </button>
          <button
            onClick={() => setTab("soon")}
            className={`px-4 py-2 text-sm ${
              tab === "soon" ? "bg-primary text-white" : "bg-transparent"
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="opacity-70">
          No {tab === "now" ? "new releases" : "upcoming titles"} in this window.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
