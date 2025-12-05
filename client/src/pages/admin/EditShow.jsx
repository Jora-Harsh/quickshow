import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const EditShow = () => {
  const { showId } = useParams();
  const { axios } = useAuth();

  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [price, setPrice] = useState("");
  const [theater, setTheater] = useState("");

  const theaters = ["INOX", "PVR", "CINEPOLIS"];

  const fetchShow = async () => {
    try {
      const { data } = await axios.get(`/api/shows/by-id/${showId}`);
      if (data.success) {
        setShow(data.show);
        const dt = new Date(data.show.showDateTime);
        setDateTime(dt.toISOString().slice(0, 16)); // datetime-local value
        setPrice(data.show.showPrice);
        setTheater(data.show.theater);
      } else {
        toast.error(data.message || "Show not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load show");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShow();
    // eslint-disable-next-line
  }, [showId]);

  const handleUpdate = async () => {
    if (!dateTime || !price || !theater) return toast.error("All fields are required");
    try {
      const payload = {
        showDateTime: new Date(dateTime),
        showPrice: Number(price),
        theater,
      };
      const { data } = await axios.put(`/api/shows/update/${showId}`, payload);
      if (data.success) {
        toast.success("Show updated");
        window.location.href = "/admin/manage-shows";
      } else toast.error(data.message || "Update failed");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!show) return <p className="text-gray-400">Show not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Edit Show</h1>

      <label className="block text-sm mb-1">Date & Time</label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className="w-full p-2 bg-[#1b1c1f] border border-gray-600 rounded"
      />

      <label className="block text-sm mt-4 mb-1">Price</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 bg-[#1b1c1f] border border-gray-600 rounded"
      />

      <label className="block text-sm mt-4 mb-1">Theater</label>
      <select
        value={theater}
        onChange={(e) => setTheater(e.target.value)}
        className="w-full p-2 bg-[#1b1c1f] border border-gray-600 rounded"
      >
        <option value="">Select Theater</option>
        {theaters.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="flex gap-3 mt-6">
        <button onClick={handleUpdate} className="px-4 py-2 bg-primary text-white rounded">
          Update Show
        </button>
        <button onClick={() => (window.location.href = "/admin/manage-shows")} className="px-4 py-2 bg-gray-600 text-white rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditShow;
