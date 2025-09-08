import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form.email, form.password);

      if (res?.success) {
        const verified = res.user?.isAccountVerified ?? false;
        navigate(verified ? "/" : "/verify");
      } else {
        setError(res?.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-[#121212] rounded-xl shadow-xl p-7 space-y-5 border border-gray-800">
        <h1 className="text-3xl font-bold text-white text-center tracking-tight">
          Welcome Back
        </h1>
        <p className="text-center text-gray-400 text-sm">
          Sign in to access your QuickShow account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 text-sm"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-pink-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-shadow shadow-md hover:shadow-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-400">
          <button
            onClick={() => navigate("/forgot")}
            className="hover:text-pink-500 transition-colors"
          >
            Forgot password?
          </button>
          <button
            onClick={() => navigate("/register")}
            className="hover:text-pink-500 transition-colors"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
