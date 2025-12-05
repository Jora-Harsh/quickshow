import React, { useState, useEffect } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { axios } = useAuth();

  // ------------------------------
  // Format ShowTime
  // ------------------------------
  const formatDateTime = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ------------------------------
  // Fetch All Bookings (Admin)
  // ------------------------------
  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings");

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error("Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Unable to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  if (loading) return <Loading />;

  // ------------------------------
  // Grouping by USER
  // ------------------------------
  const groupedByUser = bookings.reduce((acc, b) => {
    const userId = b.user?._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: b.user,
        entries: [],
      };
    }
    acc[userId].entries.push(b);
    return acc;
  }, {});

  // ------------------------------
  // Group bookings inside a user:
  // BY Movie + Theater + ShowTime
  // ------------------------------
  const groupUserBookings = (entries) => {
    const groups = {};

    entries.forEach((b) => {
      const movieId = b.show?.movie?._id || "unknown";
      const key = `${movieId}-${b.theater}-${b.showTime}`;

      if (!groups[key]) {
        groups[key] = {
          movie: b.show?.movie,
          theater: b.theater,
          showTime: b.show?.showDateTime || b.showTime,
          seats: [...b.bookedSeats],
          totalAmount: b.amount,
          isPaid: b.isPaid,
          bookings: [b],
        };
      } else {
        groups[key].seats.push(...b.bookedSeats);
        groups[key].totalAmount += b.amount;
        groups[key].bookings.push(b);
        if (b.isPaid) groups[key].isPaid = true;
      }
    });

    return Object.values(groups);
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="mt-6 w-full">
        {Object.values(groupedByUser).map((userBlock) => {
          const groupedMovies = groupUserBookings(userBlock.entries);

          return (
            <div
              key={userBlock.user._id}
              className="bg-primary/10 p-3 mb-5 rounded-md border border-primary/20"
            >
              {/* USER HEADER */}
              <h2 className="text-base font-semibold text-primary mb-3">
                👤 {userBlock.user.name}
              </h2>

              {groupedMovies.map((group, index) => (
                <div
                  key={index}
                  className="p-3 mb-3 bg-black/30 rounded-md border border-gray-700"
                >
                  {/* SUMMARY ROW */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold">
                        {group.movie?.title || "Unknown Movie"}
                      </h3>
                      <p className="text-xs text-gray-400">{group.theater}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {formatDateTime(group.showTime)}
                      </p>
                      <p className="text-xs text-gray-300">
                        Seats: {group.seats.join(" · ")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-base">
                        {currency} {group.totalAmount}
                      </p>

                      <span
                        className={`px-2 py-0.5 text-[10px] rounded ${
                          group.isPaid ? "bg-green-600/70" : "bg-yellow-600/70"
                        }`}
                      >
                        {group.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* COLLAPSIBLE DETAILS */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-primary text-xs">
                      View bookings
                    </summary>

                    <div className="mt-2 space-y-1">
                      {group.bookings.map((b, i) => (
                        <div
                          key={i}
                          className="p-2 bg-black/20 rounded border border-gray-700 text-xs"
                        >
                          <p>Seats: {b.bookedSeats.join(" · ")}</p>
                          <p>
                            Amount: {currency} {b.amount}
                          </p>
                          <p>Status: {b.isPaid ? "Paid" : "Pending"}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ListBookings;
