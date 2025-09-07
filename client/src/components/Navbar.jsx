// src/components/Navbar.jsx
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 shadow text-white">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={assets.logo} alt="Logo" className="w-32" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/theaters">Theaters</Link>
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
            <div className="flex items-center gap-3">
              {/* Show username and verification status */}
              <span className="font-medium text-white">
                Hello,  {user.name}{" "}
                {user.isAccountVerified ? (
                  <span className="text-green-400 text-sm">(Verified)</span>
                ) : (
                  <span className="text-yellow-400 text-sm">(Not Verified)</span>
                )}
              </span>

              {/* Show verify button only if not verified */}
              {!user.isAccountVerified && (
                <button
                  onClick={() => navigate("/verify")}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 rounded-full text-sm transition"
                >
                  Verify Account
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full transition"
              >
                Logout
              </button>
            </div>
          )}

          {/* Hamburger */}
          <MenuIcon
            className="block lg:hidden w-6 h-6 cursor-pointer"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 z-50">
          <XIcon
            className="absolute top-5 right-6 w-7 h-7 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <Link onClick={() => setIsOpen(false)} to="/">Home</Link>
          <Link onClick={() => setIsOpen(false)} to="/movies">Movies</Link>
          <Link onClick={() => setIsOpen(false)} to="/theaters">Theaters</Link>
          <Link onClick={() => setIsOpen(false)} to="/releases">Releases</Link>
          <Link onClick={() => setIsOpen(false)} to="/favorite">Favourites</Link>

          {/* Mobile Verify button */}
          {user && !user.isAccountVerified && (
            <button
              onClick={() => {
                navigate("/verify");
                setIsOpen(false);
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-full text-sm transition"
            >
              Verify Account
            </button>
          )}

          {/* Mobile Logout */}
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full text-sm transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
