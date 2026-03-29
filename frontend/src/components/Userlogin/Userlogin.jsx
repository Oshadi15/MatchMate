import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Userlogin.css";

const Login = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // 🔴 for individual field errors

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    }));

    // Clear field error while typing
    setFieldErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const errors = {};

    // 🔴 Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // 🔴 Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  /* ================= LOGIN FUNCTION ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationErrors = validate();

    // 🔴 Stop if validation fails
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const res = await API.post("/api/users/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

    /* ==========================================
       ✅ HARD CODED ADMIN LOGIN
    ========================================== */

    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    if (
      formData.email === adminEmail &&
      formData.password === adminPassword
    ) {
      const adminUser = {
        name: "Administrator",
        email: adminEmail,
        role: "admin",
      };

      // save admin session
      localStorage.setItem("user", JSON.stringify(adminUser));

      alert("Admin Login Successful!");
      navigate("/admin");
      return;
    }

    /* ==========================================
       ✅ NORMAL USER LOGIN (BACKEND)
    ========================================== */

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );

      // save user data
      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Login Successful!");

      // role-based redirect
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setError("Invalid Email or Password");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">Login</button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;