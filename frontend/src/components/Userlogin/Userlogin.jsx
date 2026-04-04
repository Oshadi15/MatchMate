import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Userlogin.css";

const Login = () => {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= LOGIN FUNCTION ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

  
        

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
        navigate("/");
      }
    } catch (err) {
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
          Don't have an account? <Link to="/signup">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;