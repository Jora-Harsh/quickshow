// client/src/pages/admin/DashBoard.jsx
import React, { useEffect, useState, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const DashBoard = () => {
  const currency = "₹";
  const [data, setData] = useState(null);
  const { axios, image_base_url } = useAuth();

  // dropdown state: null | 'excel' | 'pdf'
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // close menu on outside click/touch
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, []);

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

  if (!data) return <Loading />;

  const API_BASE = import.meta.env.VITE_API_URL || "";

  // Generic file download helper (works cross-platform)
  const downloadFile = async (path, defaultName) => {
    try {
      const url = `${API_BASE}${path}`;
      const res = await axios.get(url, { responseType: "blob", withCredentials: true });

      const cd = res.headers["content-disposition"] || "";
      const m = cd.match(/filename="?(.+)"?/);
      const filename = m ? m[1] : defaultName;

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);

      // close menu after download
      setOpenMenu(null);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download report");
      setOpenMenu(null);
    }
  };

  // Excel / PDF handlers
  const handleExcel = (type) => {
    if (type === "users") downloadFile("/api/reports/users/excel", `users-${Date.now()}.xlsx`);
    if (type === "bookings") downloadFile("/api/reports/bookings/excel", `bookings-${Date.now()}.xlsx`);
    if (type === "movies") downloadFile("/api/reports/movies/revenue/excel", `movie-revenue-${Date.now()}.xlsx`);
  };

  const handlePDF = (type) => {
    if (type === "users") downloadFile("/api/reports/users/pdf", `users-${Date.now()}.pdf`);
    if (type === "bookings") downloadFile("/api/reports/bookings/pdf", `bookings-${Date.now()}.pdf`);
    if (type === "movies") downloadFile("/api/reports/movies/revenue/pdf", `movie-revenue-${Date.now()}.pdf`);
  };

  const formatNumber = (num) => (typeof num === "number" ? num.toLocaleString("en-IN") : num);

  const cards = [
    { title: "Total Bookings", value: formatNumber(data.totalBookings || 0), icon: LineChart },
    { title: "Total Revenue", value: `${currency} ${formatNumber(data.totalRevenue || 0)}`, icon: CircleDollarSign },
    { title: "Active Shows", value: (data.activeShows || []).length, icon: PlayCircle },
    { title: "Total Users", value: formatNumber(data.totalUser || 0), icon: User },
  ];

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="relative mt-6">
        <BlurCircle top="-100px" left="0" />

        {/* STAT CARDS: responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-3 bg-primary/10 border border-primary/20 rounded-md shadow-sm hover:shadow-md transition"
              >
                <div>
                  <h1 className="text-xs text-white-500">{card.title}</h1>
                  <p className="text-lg font-medium mt-1 text-white-800">{card.value}</p>
                </div>
                <Icon className="w-6 h-6 text-primary/80" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SHOWS: horizontally scrollable on small screens */}
      <p className="mt-8 text-lg font-medium">Active Shows</p>

      <div className="relative mt-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.activeShows.map((item, idx) => (
            <div key={idx} className="min-w-[12rem] w-48 rounded-lg overflow-hidden bg-primary/10 border border-primary/20">
              <div className="aspect-[2/3] w-full">
                <img src={image_base_url + item.movie.poster_path} alt={item.movie.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <p className="font-medium truncate text-sm">{item.movie.title}</p>
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
      </div>

      {/* REPORTS: grouped buttons, responsive */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Reports
        </h2>

        <div ref={menuRef} className="flex flex-col sm:flex-row gap-4">
          {/* Excel group - mobile: full width; desktop: inline */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setOpenMenu(openMenu === "excel" ? null : "excel")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded shadow hover:bg-blue-700 transition"
              aria-expanded={openMenu === "excel"}
            >
              Download Excel <ChevronDown className="w-4 h-4" />
            </button>

            {openMenu === "excel" && (
              <div className="absolute left-0 mt-2 w-full sm:w-56 bg-black rounded shadow-md ring-1 ring-black ring-opacity-5 z-50">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-800" onClick={() => handleExcel("users")}>
                  Users (Excel)
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-800" onClick={() => handleExcel("bookings")}>
                  Bookings (Excel)
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-800" onClick={() => handleExcel("movies")}>
                  Movie Revenue (Excel)
                </button>
              </div>
            )}
          </div>

          {/* PDF group */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setOpenMenu(openMenu === "pdf" ? null : "pdf")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-700 text-white px-4 py-3 rounded shadow hover:bg-red-800 transition"
              aria-expanded={openMenu === "pdf"}
            >
              Download PDF <ChevronDown className="w-4 h-4" />
            </button>

            {openMenu === "pdf" && (
              <div className="absolute left-0 mt-2 w-full sm:w-64 bg-black rounded shadow-md ring-1 ring-black ring-opacity-5 z-50">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-800" onClick={() => handlePDF("users")}>
                  Users (PDF)
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-800" onClick={() => handlePDF("bookings")}>
                  Bookings (PDF)
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-800" onClick={() => handlePDF("movies")}>
                  Movie Revenue (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
