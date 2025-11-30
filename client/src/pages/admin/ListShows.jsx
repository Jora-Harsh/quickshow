import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const currency = "₹";
  const [groupedShows, setGroupedShows] = useState({});
  const [loading, setLoading] = useState(true);

  const { axios, image_base_url } = useAuth();

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
      const { data } = await axios.get("/api/admin/all-shows", {
        withCredentials: true,
      });

      if (!data.success) return toast.error("Failed to load shows");

      // ⭐ Group shows by movie
      const groups = {};

      data.shows.forEach((show) => {
        const movieId = show.movie._id;

        if (!groups[movieId]) {
          groups[movieId] = {
            movie: show.movie,
            shows: [],
          };
        }

        groups[movieId].shows.push({
          time: show.showDateTime,
          totalBookings: show.totalBookings,
          earnings: show.totalEarnings,
        });
      });

      setGroupedShows(groups);
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

        {Object.values(groupedShows).map((group) => (
          <div
            key={group.movie._id}
            className="bg-primary/20 border border-primary/30 rounded-lg p-4 mb-8"
          >
            {/* Movie Header */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={image_base_url + group.movie.poster_path}
                className="w-14 h-20 rounded-lg object-cover border border-primary/30"
                alt={group.movie.title}
              />
              <h2 className="text-xl font-semibold">{group.movie.title}</h2>
            </div>

            {/* Table for that movie's shows */}
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-sm text-white">
                <thead>
                  <tr className="bg-primary/30 uppercase tracking-wide text-xs">
                    <th className="p-3 text-left font-medium">Show Time</th>
                    <th className="p-3 text-left font-medium">Total Bookings</th>
                    <th className="p-3 text-left font-medium">Earnings</th>
                  </tr>
                </thead>

                <tbody>
                  {group.shows.map((show, index) => (
                    <tr
                      key={index}
                      className="border-b border-primary/20 bg-primary/10 even:bg-primary/15 hover:bg-primary/25 transition"
                    >
                      <td className="p-3">{formatDateTime(show.time)}</td>
                      <td className="p-3">{show.totalBookings}</td>
                      <td className="p-3 font-semibold">
                        {currency} {show.earnings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListShows;
