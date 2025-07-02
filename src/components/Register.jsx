import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://survey-backend-vugm.onrender.com/auth/register",
        user
      );
      console.log("Registered:", res.data);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);
      alert("Registration failed");
    }
  };

  return (
<div className="h-screen w-full animate-gradient flex items-center justify-center text-white  ">
      <form
        onSubmit={handleRegister}
        className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm border border-gray-700"
      >
        <h2 className="text-2xl  mb-4 text-center">Register</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={user.username}
          onChange={handleChange}
          className="w-full p-2 mb-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring focus:border-blue-500"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
          className="w-full p-2 mb-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring focus:border-blue-500"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring focus:border-blue-500"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded transition"
        >
          Register
        </button>

        <p className="text-sm mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
