import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const { axios, image_base_url } = useAuth();

  // Format date & time
  const formatDateTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", { withCredentials: true });
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error("Failed to load shows");
      }
    } catch (err) {
      console.error("Error fetching shows:", err);
      toast.error("Something went wrong while fetching shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="relative mt-6">
        <BlurCircle top="-80px" left="0" />

        <div className="bg-primary/20 border border-primary/30 rounded-lg overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm text-white">
              <thead>
                <tr className="bg-primary/30 uppercase tracking-wide text-xs">
                  <th className="p-3 text-left font-medium pl-5">Movie</th>
                  <th className="p-3 text-left font-medium">Show Time</th>
                  <th className="p-3 text-left font-medium">Total Bookings</th>
                  <th className="p-3 text-left font-medium">Earnings</th>
                </tr>
              </thead>

              <tbody>
                {shows.map((show, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary/20 bg-primary/10 even:bg-primary/15 hover:bg-primary/25 transition duration-200"
                  >
                    <td className="p-3 pl-5 flex items-center gap-3 font-medium text-white/90">
                      {show.movie?.poster_path && (
                        <img
                          src={image_base_url + show.movie.poster_path}
                          alt={show.movie.title}
                          className="w-10 h-14 object-cover rounded-md border border-primary/20"
                        />
                      )}
                      {show.movie?.title || "Untitled"}
                    </td>

                    <td className="p-3 text-gray-200">{formatDateTime(show.showDateTime)}</td>

                    <td className="p-3 text-gray-200">{show.totalBookings || 0}</td>

                    <td className="p-3 text-gray-100 font-semibold">
                      {currency} {show.totalEarnings || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-400 sm:hidden text-center">
          💡 Tip: Swipe left/right to view the full table.
        </p>
      </div>
    </>
  );
};

export default ListShows;
