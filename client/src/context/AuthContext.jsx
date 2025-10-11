// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // -----------------------------
  // Load user on page refresh
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/auth/is-authenticated`,
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [API_URL]);

  // -----------------------------
  // Login
  // -----------------------------
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      if (res.data.user.isAdmin) {
        window.location.href = "/admin"; // redirect admin to admin dashboard
      } else {
        window.location.href = "/"; // normal user
      }

      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  // -----------------------------
  // Register (with optional profile pic)
  // -----------------------------
  const register = async (name, email, password, profilePicFile) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (profilePicFile) formData.append("profilePic", profilePicFile);

      const res = await axios.post(`${API_URL}/api/auth/register`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      return res.data;
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user");
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // Upload Profile Picture (after login)
  // -----------------------------
  const uploadProfilePic = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const res = await axios.post(`${API_URL}/api/user/upload-profile-pic`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        // Update user state with new profile pic
        const updatedUser = { ...user, profilePic: res.data.profilePic };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return res.data;
    } catch (err) {
      console.error("Upload profile picture failed:", err);
      return { success: false, message: err.response?.data?.message || "Upload failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        uploadProfilePic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
