import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a saved token, check who the user is
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      api.get("/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    setAccessToken(res.data.access);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    const refresh = localStorage.getItem("refresh");
    try {
      await api.post(
        "/auth/logout/",
        { refresh },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (e) {
      // even if this fails, still clear local state
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}