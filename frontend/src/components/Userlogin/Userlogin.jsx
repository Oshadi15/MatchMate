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
  const [fieldErrors, setFieldErrors] = useState({}); // 🔴 for individual field errors

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
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

      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue</p>

        {/* 🔴 Global error */}
        {error && <p className="login-message error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">

          {/* EMAIL */}
          <div className="login-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={fieldErrors.email ? "input-error" : ""}
            />
            {fieldErrors.email && (
              <p className="field-error">{fieldErrors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={fieldErrors.password ? "input-error" : ""}
            />
            {fieldErrors.password && (
              <p className="field-error">{fieldErrors.password}</p>
            )}
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <p className="login-footer">
          Don’t have an account?{" "}
          <Link to="/signup">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;