import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register(form.name, form.email, form.password, file);
      if (res.success) navigate("/");
      else setError(res.message);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-[#121212] rounded-xl shadow-xl p-6 space-y-5 border border-gray-800">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">
          Create Account
        </h1>
        <p className="text-center text-gray-400 text-sm">
          Sign up to access your QuickShow account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Your Name"
              className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 text-sm"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-300 mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-gray-300"
            />
            {preview && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={preview}
                  alt="preview"
                  className="w-16 h-16 rounded-full object-cover border border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="px-2 py-1 text-xs bg-red-600 rounded text-white hover:bg-red-500 transition"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-pink-500 text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-shadow shadow-md hover:shadow-lg"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="flex justify-center text-sm text-gray-400">
          <button
            onClick={() => navigate("/login")}
            className="hover:text-pink-500 transition-colors"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}
