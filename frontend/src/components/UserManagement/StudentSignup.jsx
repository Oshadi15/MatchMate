// src/components/UserManagement/StudentSignup.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import logoImage from "../../assets/f2.png";
import "./StudentSignup.css"; // ✅ external CSS

export default function StudentSignup() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const validateForm = () => {
    if (!form.username || !form.email || !form.password) {
      setMsg("Please fill all required fields");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMsg("Passwords do not match");
      return false;
    }
    return true;
  };

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data } = await API.post("/auth/signup", form);

      if (data.ok) {
        setMsg("Signup successful!");
        setTimeout(() => nav("/login"), 1500);
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      setMsg("Signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">

        <div className="signup-header">
          <img src={logoImage} alt="logo" className="logo" />
          <h2>Create Account</h2>
        </div>

        <form onSubmit={submit} className="signup-form">
          <input placeholder="Username"
            onChange={(e)=>setForm({...form, username:e.target.value})} />

          <input placeholder="Full Name"
            onChange={(e)=>setForm({...form, name:e.target.value})} />

          <input placeholder="Email"
            onChange={(e)=>setForm({...form, email:e.target.value})} />

          <input placeholder="Phone"
            onChange={(e)=>setForm({...form, phone:e.target.value})} />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e)=>setForm({...form, password:e.target.value})}
            />
            <button type="button" onClick={()=>setShowPassword(!showPassword)}>
              👁
            </button>
          </div>

          <input type="password" placeholder="Confirm Password"
            onChange={(e)=>setForm({...form, confirmPassword:e.target.value})} />

          <button className="signup-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Signup"}
          </button>
        </form>

        {msg && <p className="message">{msg}</p>}

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}