import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.0002",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_3",
            C1: "user_3",
          },
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />

      {/* Responsive table wrapper */}
      <div className="mt-6 w-full">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-2 sm:px-0">
            <table className="min-w-[640px] sm:min-w-full w-full border-collapse rounded-md overflow-hidden text-nowrap">
              <thead>
                <tr className="bg-primary/20 text-left text-white">
                  <th className="p-2 sm:p-3 font-medium pl-5">Movie Name</th>
                  <th className="p-2 sm:p-3 font-medium">Show Time</th>
                  <th className="p-2 sm:p-3 font-medium">Total Booking</th>
                  <th className="p-2 sm:p-3 font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm font-light">
                {shows.map((show, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-2 sm:p-3 min-w-40 pl-5">{show.movie.title}</td>
                    <td className="p-2 sm:p-3">{formatDateTime(show.showDateTime)}</td>
                    <td className="p-2 sm:p-3">
                      {Object.keys(show.occupiedSeats).length}
                    </td>
                    <td className="p-2 sm:p-3">
                      {currency} {Object.keys(show.occupiedSeats).length * show.showPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional helper text for mobile */}
        <p className="mt-2 text-xs text-gray-400 sm:hidden">
          Tip: swipe left/right to see more.
        </p>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;
