import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyTheaters } from "../assets/assets";

export default function Theaters() {
    const navigate = useNavigate();

    const [q, setQ] = useState("");
    const [city, setCity] = useState("All");

    const cities = useMemo(() => {
        const set = new Set(dummyTheaters.map(t => t.city).filter(Boolean));
        return ["All", ...Array.from(set)];
    }, []);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return dummyTheaters.filter(t => {
            const matchCity = city === "All" || t.city === city;
            const matchQ =
                !query ||
                t.name.toLowerCase().includes(query) ||
                (t.address || "").toLowerCase().includes(query);
            return matchCity && matchQ;
        });
    }, [q, city]);

    const viewShows = (theaterId) => {
        // persist across pages
        sessionStorage.setItem("selectedTheaterId", theaterId);
        // also pass via query
        navigate(`/movies?theater=${encodeURIComponent(theaterId)}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pt-[120px] md:pt-[160px]">
            <h1 className="text-3xl font-semibold mb-6">Theaters</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search theaters or address…"
                    className="px-3 py-2 rounded-md bg-[#1a1a1a] border border-white/10 outline-none w-full sm:max-w-sm"
                />
                <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-3 py-2 rounded-md bg-[#1a1a1a] border border-white/10 outline-none w-full sm:w-auto"
                >
                    {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Theater cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((t) => (
                    <article key={t.id} className="rounded-2xl p-5 border border-primary/20 bg-primary/10">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold">{t.name}</h2>
                                <p className="text-sm opacity-80">{t.address}</p>
                                <p className="text-xs opacity-70 mt-1">{t.city}{t.phone ? ` • ${t.phone}` : ""}</p>
                                {t.hours && <p className="text-xs opacity-70">Hours: {t.hours}</p>}
                            </div>
                        </div>

                        {Array.isArray(t.amenities) && t.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {t.amenities.map((a) => (
                                    <span
                                        key={a}
                                        className="px-2 py-0.5 text-xs rounded-full border border-white/10"
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <button
                                onClick={() => viewShows(t.id)}
                                className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-white text-sm active:scale-95 transition"
                            >
                                View Shows
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="opacity-70 mt-8">No theaters match your filters.</p>
            )}
        </div>
    );
}
