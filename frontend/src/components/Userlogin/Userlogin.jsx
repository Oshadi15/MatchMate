import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Userlogin.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ FIXED API PATH
      const res = await API.post("/api/users/login", formData);

      // ✅ Save token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      // ✅ Redirect based on role
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard"); // student redirect
      }

    } catch (err) {
      // ✅ Show backend error message
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue</p>

        {error && <p className="login-message error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <p className="login-footer">
          Don’t have an account?{" "}
          <Link to="/signup">Register</Link> {/* ✅ FIXED */}
        </p>
      </div>
    </div>
  );
}

export default Login;