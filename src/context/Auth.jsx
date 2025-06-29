import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Axios interceptor to attach token to all requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Check token on first load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await axios.get("http://localhost:5000/auth/me");
          setToken(storedToken);
          setUser(response.data.user);
        } catch (err) {
          console.error("Auth check failed", err);
          logout();
        }
      }
    };
    checkAuth();
  }, []);

  // Modified storeToken: saves token and fetches user info
  const storeToken = async (serverToken) => {
    localStorage.setItem("token", serverToken);
    setToken(serverToken);
    try {
      const response = await axios.get("http://localhost:5000/auth/me");
      setUser(response.data.user);
    } catch (err) {
      console.error("Failed to fetch user after storing token", err);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      storeToken, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
