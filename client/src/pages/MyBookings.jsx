import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import timeFormate from '../lib/timeFormate';
import { dateFormate } from '../lib/dateFormate';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, user, image_base_url } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch all user bookings
  const getMyBookings = async () => {
    try {
      const { data } = await axios.get(`/api/bookings/my-bookings`, {
        withCredentials: true,
      });
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) getMyBookings();
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length > 0 ? (
        bookings.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-3 md:p-4 max-w-3xl"
          >
            {/* 🎬 Movie Info */}
            <div className="flex flex-col md:flex-row flex-1">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt={item.show.movie.title}
                className="md:w-44 aspect-video object-cover rounded-md"
              />
              <div className="flex flex-col p-3 flex-1">
                <p className="text-lg font-semibold leading-snug">
                  {item.show.movie.title}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {timeFormate(item.show.movie.runtime)}
                </p>
                <p className="text-gray-400 text-sm mt-auto">
                  {dateFormate(item.show.showDateTime)}
                </p>
              </div>
            </div>

            {/* 💳 Booking Info */}
            <div className="flex flex-col md:items-end md:text-right justify-between p-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold">
                  {currency}
                  {item.amount}
                </p>
                {!item.isPaid && (
                  <Link
                    to={item.paymentLink}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2 text-sm rounded-full font-medium shadow-sm transition-all duration-200"
                  >
                    Pay Now
                  </Link>
                )}
              </div>

              <div className="text-sm mt-2 md:mt-4">
                <p>
                  <span className="text-gray-400">Total Tickets: </span>
                  {item.bookedSeats.length}
                </p>
                <p>
                  <span className="text-gray-400">Seat Numbers: </span>
                  {item.bookedSeats.join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No bookings found.</p>
      )}
    </div>
  );
};

export default MyBookings;
