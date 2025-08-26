import React, { useEffect, useState } from "react";
import { dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { LineChart, CircleDollarSign, PlayCircle, User, Star, } from "lucide-react";

const DashBoard = () => {
  const currency = "$"; // fixed to dollar sign
  const [data, setData] = useState(null);

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
    setData(dummyDashboardData); // simulate fetch
  }, []);

  if (!data) return <Loading />;

  const formatNumber = (num) => num.toLocaleString("en-IN");

  const cards = [
    { title: "Total Bookings", value: formatNumber(data.totalBookings), icon: LineChart },
    { title: "Total Revenue", value: `${currency} ${formatNumber(data.totalRevenue)}`, icon: CircleDollarSign },
    { title: "Active Shows", value: data.activeShows.length, icon: PlayCircle },
    { title: "Total Users", value: formatNumber(data.totalUser), icon: User }
  ];

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />
      <div className="relative mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- */}

      <p className="mt-10 text-lg font-medium">Active Show</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10px" />
        {data.activeShows.map((show) => (
          <div
            key={show._id}
            className="w-56 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
          >
            <img src={show.movie.poster_path} alt={show.movie.title} className="h-60 w-full object-cover" />
            <p className="font-medium p-2 truncate">{show.movie.title}</p>
            <div className="flex items-center justify-between px-2">
              <p className="text-lg font-medium">{currency} {show.showPrice}</p>
              <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>
            <p className="px-2 pt-2 text-sm text-gray-500">{formatDateTime(show.showDateTime)}</p>
          </div>
        ))}
      </div>



    </>
  );
};

export default DashBoard;
