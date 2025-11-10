// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { user, logout, uploadProfilePic } = useAuth();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const triggerFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadProfilePic(file);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Use smaller image (<10MB) and valid types.");
    } finally {
      setUploading(false);
      setDropdownOpen(false);
    }
  };

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const getAvatarSrc = () => {
    if (user?.profilePic) {
      return user.profilePic.startsWith("http")
        ? user.profilePic
        : `${API}${user.profilePic}`;
    }
    return assets.defaultAvatar;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md text-white shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={assets.logo} alt="Logo" className="w-32" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 text-white font-semibold">
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          {/* <Link to="/theaters">Theaters</Link> */}
          <Link to="/releases">Releases</Link>
          <Link to="/favorite">Favourites</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-full transition"
            >
              Login
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar */}
              <button
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
                onClick={() => setDropdownOpen((s) => !s)}
              >
                <img
                  src={getAvatarSrc()}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              </button>

              {/* Desktop Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-600">
                      {user.isAccountVerified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-yellow-600">Not Verified</span>
                      )}
                    </div>
                  </div>
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={() => {
                          navigate("/my-bookings");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        My Bookings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={triggerFile}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {uploading ? "Uploading..." : "Upload Profile Picture"}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Hamburger */}
          <MenuIcon
            className="block lg:hidden w-7 h-7 cursor-pointer"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Menu Full Screen */}
      <div
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close */}
        <XIcon
          className="absolute top-4 right-4 w-7 h-7 cursor-pointer text-white"
          onClick={() => setIsOpen(false)}
        />

        {/* Links */}
        <div className="flex flex-col items-center gap-4 w-full max-h-[80vh] overflow-y-auto">
          <Link
            onClick={() => setIsOpen(false)}
            to="/"
            className="w-full text-center py-2 text-lg font-medium rounded-md hover:bg-pink-600 transition text-white"
          >
            Home
          </Link>
          <Link
            onClick={() => setIsOpen(false)}
            to="/movies"
            className="w-full text-center py-2 text-lg font-medium rounded-md hover:bg-pink-600 transition text-white"
          >
            Movies
          </Link>
          {/* <Link
            onClick={() => setIsOpen(false)}
            to="/theaters"
            className="w-full text-center py-2 text-lg font-medium rounded-md hover:bg-pink-600 transition text-white"
          >
            Theaters
          </Link> */}
          <Link
            onClick={() => setIsOpen(false)}
            to="/releases"
            className="w-full text-center py-2 text-lg font-medium rounded-md hover:bg-pink-600 transition text-white"
          >
            Releases
          </Link>
          <Link
            onClick={() => setIsOpen(false)}
            to="/favorite"
            className="w-full text-center py-2 text-lg font-medium rounded-md hover:bg-pink-600 transition text-white"
          >
            Favourites
          </Link>

          {/* Mobile actions */}

          {user && (
            <>
              <button
                onClick={() => {
                  navigate("/my-bookings");
                  setIsOpen(false);
                }}
                className="w-full py-2 text-lg font-medium text-center bg-gray-800 hover:bg-gray-700 rounded-md text-white transition"
              >
                My Bookings
              </button>
              <button
                onClick={() => {
                  triggerFile();
                  setIsOpen(false);
                }}
                className="w-full py-2 text-lg font-medium text-center bg-gray-800 hover:bg-gray-700 rounded-md text-white transition"
              >
                Upload Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 text-lg font-medium text-center bg-red-600 hover:bg-red-500 rounded-md text-white transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
