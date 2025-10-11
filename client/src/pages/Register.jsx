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

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

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
    <div className="min-h-screen flex items-center justify-center bg-black px-2">
      <div className="w-full max-w-xs bg-[#121212] rounded-lg shadow-lg p-4 space-y-4 border border-gray-800">
        <h1 className="text-xl font-bold text-white text-center">Create Account</h1>
        <p className="text-center text-gray-400 text-xs">Sign up to access your QuickShow account</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-300 text-xs mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Your Name"
              className="w-full px-2 py-1.5 rounded bg-[#1c1c1c] text-white border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="w-full px-2 py-1.5 rounded bg-[#1c1c1c] text-white border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full px-2 py-1.5 rounded bg-[#1c1c1c] text-white border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 text-xs"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-gray-300 text-sm"
            />
            {preview && (
              <div className="mt-1 flex items-center gap-2">
                <img
                  src={preview}
                  alt="preview"
                  className="w-12 h-12 rounded-full object-cover border border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="px-2 py-0.5 text-xs bg-red-600 rounded text-white hover:bg-red-500"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-pink-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-shadow shadow-md"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="flex justify-center text-xs text-gray-400">
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
