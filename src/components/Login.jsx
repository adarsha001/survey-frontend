// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/Auth";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { storeToken } = useAuth(); // Correct case: storeToken not storetoken

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("https://survey-backend-vugm.onrender.com/auth/login", user); // Updated endpoint
      await storeToken(res.data.token) // Correct case here
      
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <input
        type="text" // Changed to email type for better validation
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={handleChange}
        className="w-full p-2 mb-3 border rounded"
        required
      />

      <input
        type="text"
        name="password"
        placeholder="Password"
        value={user.password}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
        required
        minLength="6"
      />

      <button 
        type="submit" 
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;