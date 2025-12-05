import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const ManageShows = () => {
  const { axios, image_base_url } = useAuth();
  const [groups, setGroups] = useState([]); // expected: [{ movie, shows: [{ showId, time, theater, price }] }]
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); // search

  const fetchGroups = async () => {
    try {
      const { data } = await axios.get("/api/shows/all-grouped"); // must return grouped format
      if (data.success) setGroups(data.shows || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const deleteShow = async (showId) => {
    if (!window.confirm("Delete this show permanently?")) return;
    try {
      const { data } = await axios.delete(`/api/shows/delete/${showId}`);
      if (data.success) {
        toast.success("Show deleted");
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // quick filter by movie title
  const filtered = groups.filter((g) =>
    (g.movie?.title || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Shows</h1>

        <div className="flex items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies..."
            className="px-3 py-2 bg-[#111214] border border-gray-700 rounded text-sm w-56"
          />
          <button
            onClick={fetchGroups}
            className="px-3 py-2 bg-primary rounded text-white text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No movies / shows found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((group) => {
            const movie = group.movie || {};
            const poster = movie.poster_path ? image_base_url + movie.poster_path : "/placeholder.png";

            return (
              <div
                key={movie._id}
                className="bg-[#18191b] border border-gray-700 shadow-sm rounded-lg overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center gap-3 p-3">
                  <img
                    src={poster}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold truncate">{movie.title}</h2>
                      <span className="text-xs text-gray-400">{movie.release_date}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{movie.tagline || movie.overview?.slice(0, 80)}</p>
                  </div>
                </div>

                {/* Ultra-compact table */}
                <div className="p-2">
                  <div className="text-xs text-gray-300 font-medium mb-2">Showtimes ({group.shows.length})</div>

                  <div className="w-full overflow-auto">
                    <table className="w-full text-xs table-fixed">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="pr-2 w-32">Date</th>
                          <th className="pr-2 w-20">Time</th>
                          <th className="pr-2 w-20">Theater</th>
                          <th className="pr-2 w-16">Price</th>
                          <th className="w-28">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {group.shows.map((s) => {
                          const dt = new Date(s.time);
                          return (
                            <tr key={s.showId} className="align-top">
                              <td className="py-2 pr-2 text-gray-200">
                                {dt.toLocaleDateString("en-GB")}
                              </td>

                              <td className="py-2 pr-2 text-gray-200">
                                {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </td>

                              <td className="py-2 pr-2 text-gray-200">
                                <span className="text-gray-300 text-xs">{s.theater}</span>
                              </td>

                              <td className="py-2 pr-2 text-gray-200">
                                <span className="text-gray-100">₹{s.price}</span>
                              </td>

                              <td className="py-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => (window.location.href = `/admin/edit-show/${s.showId}`)}
                                    className="px-2 py-1 bg-yellow-500 rounded text-black text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteShow(s.showId)}
                                    className="px-2 py-1 bg-red-600 rounded text-white text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* footer actions */}
                <div className="flex gap-2 p-3 border-t border-gray-800">
                  <button
                    onClick={() => (window.location.href = `/admin/add-shows?movie=${movie._id}`)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    Add show
                  </button>

                  <button
                    onClick={fetchGroups}
                    className="px-3 py-2 bg-gray-700 text-white rounded text-sm"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageShows;
