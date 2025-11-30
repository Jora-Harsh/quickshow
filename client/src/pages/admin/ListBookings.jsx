import React, { useState, useEffect } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { axios } = useAuth();

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

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings", {
        withCredentials: true,
      });

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Something went wrong while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="mt-6 w-full">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-2 sm:px-0">
            <table className="min-w-[950px] sm:min-w-full w-full border-collapse rounded-md text-white">
              <thead>
                <tr className="bg-primary/30 text-left uppercase text-xs tracking-wide">
                  <th className="p-3 pl-5">User Name</th>
                  <th className="p-3">Movie Name</th>
                  <th className="p-3">Theater</th>
                  <th className="p-3">Show Time</th>
                  <th className="p-3">Seats</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="text-xs sm:text-sm font-light">
                {bookings.length > 0 ? (
                  bookings.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-primary/20 bg-primary/10 even:bg-primary/20 hover:bg-primary/25 transition"
                    >
                      <td className="p-3 pl-5 font-medium text-white/90">
                        {item.user?.name || "Unknown User"}
                      </td>

                      <td className="p-3">{item.show?.movie?.title || "N/A"}</td>

                      <td className="p-3">{item.theater || "N/A"}</td>

                      <td className="p-3">
                        {formatDateTime(item.show?.showDateTime)}
                      </td>

                      <td className="p-3">
                        {item.bookedSeats?.join(" · ") || "N/A"}
                      </td>

                      <td className="p-3 font-semibold text-right">
                        {currency} {item.amount || 0}
                      </td>

                      <td className="p-3 text-center">
                        {item.isPaid ? (
                          <span className="px-2 py-1 text-xs bg-green-600/70 rounded-md">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-yellow-600/70 rounded-md">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-gray-400 italic"
                    >
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-400 sm:hidden">
          💡 Swipe left/right to see more.
        </p>
      </div>
    </>
  );
};

export default ListBookings;
