import React, { useState, useEffect } from 'react'
import { dummyBookingData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [booking, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllBookings = async () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-CA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  return !isLoading ? (
    <>
      <Title text1="List" text2="Bookings" />

      {/* Responsive table wrapper */}
      <div className="mt-6 w-full">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-2 sm:px-0">
            <table className="min-w-[720px] sm:min-w-full w-full border-collapse rounded-md overflow-hidden text-nowrap">
              <thead>
                <tr className="bg-primary/20 text-left text-white">
                  <th className="p-2 sm:p-3 font-medium pl-5">User Name</th>
                  <th className="p-2 sm:p-3 font-medium">Movie Name</th>
                  <th className="p-2 sm:p-3 font-medium">Show Time</th>
                  <th className="p-2 sm:p-3 font-medium">Seats</th>
                  <th className="p-2 sm:p-3 font-medium">Amount</th>
                </tr>
              </thead>

              <tbody className="text-xs sm:text-sm font-light">
                {booking.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-2 sm:p-3 min-w-40 pl-5">{item.user.name}</td>
                    <td className="p-2 sm:p-3">{item.show.movie.title}</td>
                    <td className="p-2 sm:p-3">{formatDateTime(item.show.showDateTime)}</td>
                    <td className="p-2 sm:p-3">
                      {Object.keys(item.bookedSeats)
                        .map((seat) => item.bookedSeats[seat])
                        .join(', ')}
                    </td>
                    <td className="p-2 sm:p-3">
                      {currency} {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional helper text on very small screens */}
        <p className="mt-2 text-xs text-gray-400 sm:hidden">
          Tip: swipe left/right to see more.
        </p>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;
