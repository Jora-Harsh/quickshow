import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // step 1: email, step 2: OTP + new password
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/send-reset-otp",
        { email: form.email },
        { withCredentials: true }
      );
      if (res.data.success) {
        setStep(2);
        setSuccess("OTP sent to your email!");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/reset-password",
        { email: form.email, otp: form.otp, newPassword: form.newPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black font-sans px-4">
      <div className="w-full max-w-sm bg-[#121212] rounded-xl shadow-xl p-6 space-y-6 border border-gray-800">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">
          Forgot Password
        </h1>
        <p className="text-center text-gray-400 text-sm">
          {step === 1
            ? "Enter your email to receive OTP"
            : "Enter the OTP sent to your email and new password"}
        </p>

        <form
          onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
          className="space-y-4"
        >
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>

          {step === 2 && (
            <>
              <div>
                <label className="block text-gray-300 mb-1">OTP</label>
                <input
                  type="text"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
                  placeholder="Enter OTP"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-pink-500 text-center">{error}</p>}
          {success && <p className="text-sm text-pink-500 text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-shadow shadow-md hover:shadow-lg"
          >
            {loading
              ? step === 1
                ? "Sending OTP..."
                : "Resetting..."
              : step === 1
              ? "Send OTP"
              : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
