// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Menu as MenuIcon, X as XIcon, Search as SearchIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // avatar dropdown
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false); // mobile search overlay
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { user, logout, uploadProfilePic } = useAuth();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // click outside to close avatar dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // debounced search fetch
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/movies/search?query=${encodeURIComponent(
          search
        )}`;
        const res = await fetch(url);
        if (!res.ok) return setResults([]);
        const data = await res.json();
        setResults(data.movies || []);
      } catch (err) {
        console.error("Search fetch error:", err);
        setResults([]);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [search]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    setIsOpen(false);
    setSearchOpen(false);
  };

  const triggerFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadProfilePic(file);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Use a smaller image (<10MB) and valid type.");
    } finally {
      setUploading(false);
      setDropdownOpen(false);
      setIsOpen(false);
    }
  };

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const getAvatarSrc = () =>
    user?.profilePic
      ? user.profilePic.startsWith("http")
        ? user.profilePic
        : `${API}${user.profilePic}`
      : assets.defaultAvatar;

  const onSelectMovie = (m) => {
    // close UIs and navigate only if movie exists (detail page should also handle not-found)
    setSearch("");
    setResults([]);
    setSearchOpen(false);
    setIsOpen(false);
    navigate(`/movies/${m._id}`);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md text-white shadow-md">
        <div className="flex items-center justify-between px-5 py-3 sm:px-6">
          {/* logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />
          </Link>

          {/* desktop links */}
          <div className="hidden lg:flex items-center gap-6 text-white font-semibold">
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/releases">Releases</Link>
            <Link to="/favorite">Favourites</Link>
          </div>

          {/* right side */}
          <div className="flex items-center gap-3">
            {/* desktop search (inline) */}
            <div className="hidden lg:block relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="bg-white/10 placeholder:text-white/70 text-white px-4 py-2 rounded-full w-56 text-sm outline-none focus:ring-0"
              />

              {/* dropdown */}
              {search.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="px-4 py-3 text-gray-300 text-sm">No movies found</div>
                  ) : (
                    results.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => onSelectMovie(m)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition flex items-center gap-3"
                      >
                        {/* optional small poster thumbnail if you want, for now emoji */}
                        <span className="text-lg">🎬</span>
                        <div className="truncate">{m.title}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* mobile search icon */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setIsOpen(false);
              }}
              className="block lg:hidden p-2 rounded-md bg-white/10 hover:bg-white/20"
              aria-label="Open search"
            >
              <SearchIcon className="w-5 h-5 text-white" />
            </button>

            {/* avatar / login (desktop) */}
            {user ? (
              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((s) => !s)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={getAvatarSrc()}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-black rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                      <div className="font-semibold truncate">{user.name}</div>
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
                          onClick={() => {
                            triggerFile();
                            setDropdownOpen(false);
                          }}
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
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden lg:block px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-full"
              >
                Login
              </button>
            )}

            {/* mobile hamburger */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20"
              onClick={() => {
                setIsOpen(true);
                setDropdownOpen(false);
                setSearchOpen(false);
              }}
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU (compact + scrollable) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-xl px-5 py-6 text-white flex flex-col overflow-y-auto"
          onScroll={() => {}}
        >
          <XIcon
            className="absolute top-4 right-4 w-7 h-7 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          <div className="flex justify-center mt-10">
            <img src={assets.logo} alt="logo" className="w-28" />
          </div>

          <div className="flex flex-col gap-3 mt-8 w-full max-w-[360px] mx-auto pb-10" style={{ maxHeight: "75vh" }}>
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2.5 text-center bg-white/6 rounded-md">
              Home
            </Link>

            <Link to="/movies" onClick={() => setIsOpen(false)} className="block py-2.5 text-center bg-white/6 rounded-md">
              Movies
            </Link>

            <Link to="/releases" onClick={() => setIsOpen(false)} className="block py-2.5 text-center bg-white/6 rounded-md">
              Releases
            </Link>

            <Link to="/favorite" onClick={() => setIsOpen(false)} className="block py-2.5 text-center bg-white/6 rounded-md">
              Favourites
            </Link>

            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/my-bookings");
                    setIsOpen(false);
                  }}
                  className="block py-2.5 bg-gray-900 rounded-md"
                >
                  My Bookings
                </button>

                <button
                  onClick={() => {
                    triggerFile();
                    setIsOpen(false);
                  }}
                  className="block py-2.5 bg-gray-900 rounded-md"
                >
                  Upload Profile
                </button>

                <button onClick={handleLogout} className="block py-2.5 bg-red-600 rounded-md">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => { navigate("/login"); setIsOpen(false); }} className="block py-2.5 bg-pink-600 rounded-md">
                Login
              </button>
            )}
          </div>

          {/* hidden uploader */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {/* MOBILE SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/96 text-white px-5 py-6 overflow-y-auto">
          <XIcon className="absolute top-4 right-4 w-7 h-7 cursor-pointer" onClick={() => setSearchOpen(false)} />
          <div className="mt-6 max-w-[760px] mx-auto">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-white/10 px-4 py-3 rounded-full text-lg outline-none"
            />

            <div className="mt-4">
              {search.trim() && results.length === 0 && (
                <div className="text-gray-400 text-center py-6">No movies found</div>
              )}

              {results.map((m) => (
                <button
                  key={m._id}
                  onClick={() => onSelectMovie(m)}
                  className="w-full text-left py-3 border-b border-white/10"
                >
                  {m.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
