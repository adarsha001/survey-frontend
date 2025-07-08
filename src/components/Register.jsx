import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// You can also use an eye icon library if preferred

const Register = () => {
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle state
  const navigate = useNavigate();

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://survey-backend-vugm.onrender.com/auth/register",
        user
      );
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Registration failed. Please check your inputs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full animate-gradient flex items-center justify-center text-white">
      <form
        onSubmit={handleRegister}
        className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm border border-gray-700"
      >
        <h2 className="text-2xl mb-4 text-center">Register</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-700 text-white text-sm rounded">
            {error}
          </div>
        )}

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

        {/* Password with toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"} // 👁️ toggle type
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-2 text-gray-400 hover:text-white text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
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
