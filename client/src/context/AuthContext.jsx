// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on page refresh
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/is-authenticated",
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          // Ensure isAccountVerified is included
          const userData = {
            ...res.data.user,
            isAccountVerified: res.data.user.isAccountVerified || false,
            token: res.data.token,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      "http://localhost:3000/api/auth/login",
      { email, password },
      { withCredentials: true }
    );

    if (res.data.success) {
      const userData = {
        ...res.data.user,
        isAccountVerified: res.data.user.isAccountVerified || false,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(
      "http://localhost:3000/api/auth/register",
      { name, email, password },
      { withCredentials: true }
    );

    if (res.data.success) {
      const userData = {
        ...res.data.user,
        isAccountVerified: res.data.user.isAccountVerified || false,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return res.data;
  };

  const logout = async () => {
    await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
