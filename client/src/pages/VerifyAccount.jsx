import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-account?token=${token}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setStatus("success");
          setTimeout(() => navigate("/"), 2000); // redirect home
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    verifyAccount();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-[#121212] border border-gray-800 rounded-xl p-8 shadow-xl space-y-6 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Account Verification
        </h1>

        {status === "loading" && (
          <p className="text-gray-400">Verifying your account...</p>
        )}

        {status === "success" && (
          <p className="text-green-400">✅ Your account is verified!</p>
        )}

        {status === "error" && (
          <p className="text-red-500">❌ Verification failed. Link is invalid or expired.</p>
        )}
      </div>
    </div>
  );
}
