import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, DeleteIcon, StarIcon, ChevronDown } from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const AddShows = () => {
  const { axios, image_base_url } = useAuth();
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("N/A");

  // ✅ Updated static theater list (matches your SeatLayout)
  const theaters = ["INOX", "PVR", "CINEPOLIS"];

  // 🔹 Fetch movies currently playing
  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/api/shows/now-playing", {
        withCredentials: true,
      });
      if (data.success) setNowPlayingMovies(data.movies);
    } catch (error) {
      console.error("Error fetching now playing movies:", error);
    }
  };

  // 🔹 Add show handler
  const handleAddShow = async () => {
    if (!selectedMovie) return toast.error("Please select a movie first!");
    if (!showPrice) return toast.error("Please enter a show price!");
    if (Object.keys(dateTimeSelection).length === 0)
      return toast.error("Please add at least one date & time!");
    if (selectedTheater === "N/A")
      return toast.error("Please select a theater!");

    try {
      const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
        date,
        time: times,
      }));

      const { data } = await axios.post(
        "/api/shows/add",
        {
          movieId: selectedMovie,
          showsInput,
          showPrice,
          theater: selectedTheater,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("🎉 Show added successfully!");
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
        setDateTimeInput("");
        setSelectedTheater("N/A");
      } else toast.error(data.message || "Failed to add show!");
    } catch (err) {
      console.error("Error adding show:", err);
      toast.error("Server error while adding show!");
    }
  };

  // 🔹 Format time for readability
  const formatTo12Hour = (time) => {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 🔹 Add new date/time
  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;
    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  // 🔹 Remove a selected time
  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  // 🔹 MAIN UI
  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      {/* 🎬 Now Playing Movies */}
      <div className="mt-10">
        <p className="text-lg font-medium">Now Playing Movies</p>
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {nowPlayingMovies.map((movie) => (
              <div
                key={movie.id}
                className={`relative cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  selectedMovie === movie.id ? "scale-105" : ""
                }`}
                onClick={() =>
                  setSelectedMovie((prev) =>
                    prev === movie.id ? null : movie.id
                  )
                }
              >
                <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg">
                  <img
                    src={image_base_url + movie.poster_path}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover brightness-90"
                  />
                  <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-1 text-gray-300">
                      <StarIcon className="w-4 h-4 text-primary fill-primary" />
                      {movie.vote_average.toFixed(1)}
                    </p>
                    <p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
                  </div>
                </div>

                {selectedMovie === movie.id && (
                  <div className="absolute top-2 right-2 bg-primary h-6 w-6 rounded flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                )}

                <p className="font-medium truncate mt-2 text-gray-800">
                  {movie.title}
                </p>
                <p className="text-gray-400 text-sm">{movie.release_date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 💰 Show Price */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md w-full sm:w-auto shadow-sm">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter Show Price"
            className="outline-none w-full sm:w-40 bg-transparent"
          />
        </div>
      </div>

      {/* 📅 Date & Time Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Date & Time</label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-300 p-3 rounded-lg w-full max-w-md shadow-sm">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md border border-transparent focus:border-primary px-2 py-2 bg-transparent w-full sm:w-64"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/90 text-white px-5 py-2 text-sm rounded-md hover:bg-primary transition w-full sm:w-auto"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* 🎭 Theater Dropdown */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Theater</label>
        <div className="relative w-full max-w-md">
          <select
            value={selectedTheater}
            onChange={(e) => setSelectedTheater(e.target.value)}
            className="appearance-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none w-full shadow-sm"
          >
            <option value="N/A" disabled>
              Select Theater
            </option>
            {theaters.map((theater, index) => (
              <option key={index} value={theater}>
                {theater}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-gray-500 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* 🕒 Selected Times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-base sm:text-lg font-semibold text-gray-800">
            Selected Date & Time
          </h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded bg-primary/10 text-primary"
                    >
                      <span>{formatTo12Hour(time)}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🎯 Submit */}
      <button
        onClick={handleAddShow}
        className="bg-primary text-white px-6 sm:px-8 py-2 mt-8 rounded-md shadow-md hover:bg-primary/90 transition"
      >
        Add Show
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;
