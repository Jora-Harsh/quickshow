import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function VerifyAccount() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Send OTP automatically if not verified
  useEffect(() => {
    if (!user) return; // no user, do nothing
    if (user.isAccountVerified) {
      setIsVerified(true);
      return;
    }

    const sendOtpOnLoad = async () => {
      setError("");
      setSuccess("");
      setLoading(true);
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/send-verify-otp",
          {},
          { withCredentials: true } // cookie auth
        );
        if (res.data.success) {
          setSuccess("OTP sent to your email. Check your inbox!");
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    };

    sendOtpOnLoad();
  }, [user]);

  // Verify account
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/verify-account",
        { otp },
        { withCredentials: true } // important for cookie auth
      );

      if (res.data.success) {
        setSuccess("Account verified successfully!");
        setIsVerified(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/send-verify-otp",
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess("OTP resent successfully! Check your email.");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-[#121212] border border-gray-800 rounded-xl p-8 shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">
          Verify Your Account
        </h1>

        {isVerified ? (
          <p className="text-center text-green-400">
            Your account is already verified!
          </p>
        ) : (
          <>
            <p className="text-center text-gray-400 text-sm">
              Enter the OTP sent to your registered email.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1c1c1c] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
              />

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {success && <p className="text-green-400 text-sm text-center">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
              >
                {loading ? "Verifying..." : "Verify Account"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-2">
              Didn't receive the OTP?{" "}
              <button
                onClick={handleResendOtp}
                className="text-pink-500 hover:underline"
                disabled={loading}
              >
                Resend
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
