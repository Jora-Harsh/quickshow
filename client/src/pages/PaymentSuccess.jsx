import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const session_id = params.get("session_id");

      if (!session_id) {
        setStatus("Invalid session ID");
        return;
      }

      try {
        const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

        const res = await fetch(
          `${API}/api/payment/verify?session_id=${session_id}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (data.success) {
          setStatus("Payment successful! Redirecting...");
          setTimeout(() => navigate("/my-bookings?paid=true"), 1500);
        } else {
          setStatus(data.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verify Error:", err);
        setStatus("Server error verifying payment");
      }
    };

    verifyPayment();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white text-center px-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        <p className="text-gray-300">{status}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
