import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { LineChart, CircleDollarSign, PlayCircle, User, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const DashBoard = () => {
  const currency = "₹";
  const [data, setData] = useState(null);
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

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard", { withCredentials: true });
      if (data.success) setData(data.dashboardData);
      else toast.error("Failed to fetch dashboard data");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Server error fetching dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!data) return <Loading />;

  const formatNumber = (num) => num.toLocaleString("en-IN");

  const cards = [
    { title: "Total Bookings", value: formatNumber(data.totalBookings), icon: LineChart },
    { title: "Total Revenue", value: `${currency} ${formatNumber(data.totalRevenue)}`, icon: CircleDollarSign },
    { title: "Active Shows", value: data.activeShows.length, icon: PlayCircle },
    { title: "Total Users", value: formatNumber(data.totalUser), icon: User },
  ];

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />
      <div className="relative mt-6">
        <BlurCircle top="-100px" left="0" />
        {/* Slightly smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-primary/10 border border-primary/20 rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200"
            >
              <div>
                <h1 className="text-xs text-white-500">{card.title}</h1>
                <p className="text-lg font-medium mt-1 text-white-800">{card.value}</p>
              </div>
              <card.icon className="w-5 h-5 text-primary/80" />
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Active Shows ---------------- */}
      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10px" />
        {data.activeShows.map((show) => (
          <div
            key={show._id}
            className="w-48 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
          >
            <div className="aspect-[2/3] w-full">
              <img
                src={ image_base_url+show.movie.poster_path}
                alt={show.movie.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-2">
              <p className="font-medium truncate text-sm">{show.movie.title}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-medium">
                  {currency} {show.showPrice}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  {show.movie.vote_average.toFixed(1)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(show.showDateTime)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashBoard;
