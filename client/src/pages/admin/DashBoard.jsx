import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import {
  LineChart,
  CircleDollarSign,
  PlayCircle,
  User,
  Star,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const DashBoard = () => {
  const currency = "₹";
  const [data, setData] = useState(null);
  const { axios, image_base_url } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        withCredentials: true,
      });
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

  const formatNumber = (num) => (typeof num === "number" ? num.toLocaleString("en-IN") : num);

  const cards = [
    { title: "Total Bookings", value: formatNumber(data.totalBookings || 0), icon: LineChart },
    { title: "Total Revenue", value: `${currency} ${formatNumber(data.totalRevenue || 0)}`, icon: CircleDollarSign },
    { title: "Active Shows", value: (data.activeShows || []).length, icon: PlayCircle },
    { title: "Total Users", value: formatNumber(data.totalUser || 0), icon: User },
  ];

  const API_BASE = import.meta.env.VITE_API_URL || "";

  // Generic file download using axios (supports blob)
  const downloadFile = async (path, defaultName) => {
    try {
      const url = `${API_BASE}${path}`;
      const res = await axios.get(url, {
        responseType: "blob",
        withCredentials: true,
      });

      const contentDisposition = res.headers["content-disposition"] || "";
      const match = contentDisposition.match(/filename="?(.+)"?/);
      let filename = match ? match[1] : defaultName;

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download report");
    }
  };

  // Excel downloads
  const downloadUsersExcel = () => downloadFile("/api/reports/users/excel", `users-${Date.now()}.xlsx`);
  const downloadBookingsExcel = () => downloadFile("/api/reports/bookings/excel", `bookings-${Date.now()}.xlsx`);

  // PDF downloads (new)
  const downloadUsersPDF = () => downloadFile("/api/reports/users/pdf", `users-${Date.now()}.pdf`);
  const downloadBookingsPDF = () => downloadFile("/api/reports/bookings/pdf", `bookings-${Date.now()}.pdf`);

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="relative mt-6">
        <BlurCircle top="-100px" left="0" />

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 bg-primary/10 border border-primary/20 rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200"
              >
                <div>
                  <h1 className="text-xs text-white-500">{card.title}</h1>
                  <p className="text-lg font-medium mt-1 text-white-800">{card.value}</p>
                </div>
                <Icon className="w-5 h-5 text-primary/80" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- Active Shows ---------------- */}
      <p className="mt-10 text-lg font-medium">Active Shows</p>

      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10px" />

        {data.activeShows.map((item, index) => (
          <div
            key={index}
            className="w-48 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
          >
            <div className="aspect-[2/3] w-full">
              <img
                src={image_base_url + item.movie.poster_path}
                alt={item.movie.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-2">
              <p className="font-medium truncate text-sm">{item.movie.title}</p>

              {/* Rating */}
              <div className="flex items-center justify-between mt-1">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  {Number(item.movie.vote_average || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================
            REPORTS SECTION (Excel + PDF)
      ========================================= */}
      <div className="mt-16">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Reports
        </h2>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={downloadUsersExcel}
            className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition"
          >
            Download Users (Excel)
          </button>

          <button
            onClick={downloadBookingsExcel}
            className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition"
          >
            Download Bookings (Excel)
          </button>

          <button
            onClick={downloadUsersPDF}
            className="bg-red-600 text-white px-6 py-3 rounded shadow hover:bg-red-700 transition"
          >
            Download Users (PDF)
          </button>

          <button
            onClick={downloadBookingsPDF}
            className="bg-yellow-600 text-black px-6 py-3 rounded shadow hover:bg-yellow-700 transition"
          >
            Download Bookings (PDF)
          </button>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
