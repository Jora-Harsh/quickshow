import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormate from "../lib/isoTimeFormate";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const SeatLayout = () => {
  const { id, date } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const theaterId = sp.get("theater"); // e.g. "INOX"
  const timeFromQuery = sp.get("time");

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const { axios, user } = useAuth();

  // 🎬 Seat layout per theater
  const staticLayouts = {
    INOX: { rows: [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I"]], seatsPerRow: 10 },
    PVR: { rows: [["A", "B", "C", "D"], ["E", "F", "G"]], seatsPerRow: 9 },
    CINEPOLIS: { rows: [["A", "B"], ["C", "D", "E"]], seatsPerRow: 8 },
  };

  const layout = staticLayouts[theaterId] || staticLayouts["PVR"];
  const groupRows = layout.rows;
  const seatsPerRow = layout.seatsPerRow;

  // ✅ Fetch show details
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/shows/${id}`, { withCredentials: true });
      if (data.success) {
        setShow({ movie: data.movie, dateTime: data.dateTime });
      } else {
        toast.error("Show not found");
      }
    } catch (err) {
      console.error("❌ Error fetching show:", err);
      toast.error("Failed to load show details");
    }
  };

  // ✅ Fetch occupied seats by show, theater & date
  const getOccupiedSeats = async () => {
    try {
      if (!selectedTime?.showId) return;
      const { data } = await axios.get(
        `/api/bookings/occupied-seats/${selectedTime.showId}?theater=${theaterId}&date=${date}`,
        { withCredentials: true }
      );
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || []);
      } else {
        toast.error("Failed to fetch occupied seats");
      }
    } catch (err) {
      console.error("❌ Error fetching occupied seats:", err);
      toast.error("Failed to load occupied seats");
    }
  };

  useEffect(() => {
    if (selectedTime) getOccupiedSeats();
  }, [selectedTime]);

  // ✅ Seat selection handler
  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast("Please select a show time first");
    if (occupiedSeats.includes(seatId)) return toast("Seat already booked");
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5)
      return toast("You can select up to 5 seats");

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  // ✅ Booking logic
  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to book tickets");
      if (!selectedTime || selectedSeats.length === 0)
        return toast.error("Please select show time and seats");

      const ticketPrice = selectedTime?.price || show?.price || 200;
      const amount = selectedSeats.length * ticketPrice;

      const bookingData = {
        showId: selectedTime.showId,
        bookedSeats: selectedSeats,
        amount,
        theater: theaterId,
        date,
      };

      console.log("🎟️ Booking Data:", bookingData);

      const { data } = await axios.post(`/api/bookings`, bookingData, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Booking created successfully");
        navigate(`/my-bookings`);
      } else {
        console.error("⚠️ Booking Failed:", data);
        toast.error(data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      toast.error("Failed to create booking");
    }
  };

  // ✅ Render seats visually
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2 flex-wrap justify-center">
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const isOccupied = occupiedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);
        return (
          <button
            key={seatId}
            onClick={() => !isOccupied && handleSeatClick(seatId)}
            disabled={isOccupied}
            className={`h-8 w-8 rounded border border-primary/60 text-xs sm:text-sm flex items-center justify-center transition
              ${isSelected ? "bg-primary text-white" : ""}
              ${isOccupied ? "bg-gray-500 opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {seatId}
          </button>
        );
      })}
    </div>
  );

  // ✅ Load show details
  useEffect(() => {
    getShow();
  }, [id]);

  // ✅ Match selected time & theater
  useEffect(() => {
    if (!show || !timeFromQuery) return;

    const slots = show?.dateTime?.[date] || [];
    const decodedTime = decodeURIComponent(timeFromQuery);

    const match = slots.find(
      (s) => s.time === decodedTime && s.theater === theaterId && s.showId
    );

    if (match) {
      console.log("✅ Selected Time:", match);
      setSelectedTime(match);
    } else {
      console.warn("⚠️ No matching show found for", { decodedTime, theaterId });
    }
  }, [show, timeFromQuery, date, theaterId]);

  if (!show) return <Loading />;

  return (
    <div className="flex flex-col md:flex-row px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:pt-12 gap-6">
      {/* Left — Show Timings */}
      <div className="w-full md:w-60 bg-primary/10 border border-primary/20 rounded-lg py-6 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {(show?.dateTime?.[date] || []).map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormate(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-xl sm:text-2xl font-semibold mb-4 mt-30">
          Select Your Seat ({theaterId || "PVR"})
        </h1>
        <img src={assets.screenImage} alt="Screen" className="max-w-full h-auto" />
        <p className="text-gray-400 text-sm mb-6">Screen SIDE</p>

        {/* Seat Layout */}
        <div className="flex flex-col items-center mt-6 text-gray-300 w-full">
          {groupRows.map((group, idx) => (
            <div key={idx} className="flex flex-col items-center mb-6">
              {group.map((row) => renderSeats(row, seatsPerRow))}
            </div>
          ))}
        </div>

        {/* Proceed Button */}
        <button
          onClick={bookTickets}
          className="flex items-center gap-1 mt-20 px-6 sm:px-10 py-2 sm:py-3 text-xs sm:text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
