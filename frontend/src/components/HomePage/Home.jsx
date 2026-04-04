import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import "./Home.css";

// Images
import hero1 from "../../assets/f5.jpg";
import hero2 from "../../assets/f2.png";
import hero3 from "../../assets/f5.jpg";

import feature1 from "../../assets/f6.jpg";
import feature2 from "../../assets/f7.jpeg";
import feature3 from "../../assets/f9.webp";



const heroImages = [hero1, hero2, hero3];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("user")));
  }, []);

  return (
    <>
    {/* <HomeNav /> */}
{/*chat */}
{/* <button 
  className="chat-button"
  onClick={() => history("/enterpin")}
>
  <FaRobot size={38} />
</button> */}

      {/* Chat Button */}
      <button className="chat-button" onClick={() => navigate("/help")}>
        <FaRobot size={34} />
      </button>

      <div className="home-page">

        

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-slideshow">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className={`hero-slide ${index === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${img})` }}
              >
                <div className="slide-overlay">
                  <h1>Lost And Found Management System</h1>
                  <p>A smart platform to manage lost and found items.</p>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div className="slide-dots">
              {heroImages.map((_, index) => (
                <span
                  key={index}
                  className={index === currentSlide ? "active" : ""}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">

          <div 
            className="feature-card"
            onClick={() => navigate("/browseitems")}
            style={{ cursor: "pointer" }}
          >
            <img src={feature1} alt="Browse Items" />
            <h3>Browse Items</h3>
            <p>Smart lost and found system.</p>
          </div>

          <div 
            className="feature-card"
            onClick={() => navigate(isLoggedIn ? "/campus-assistant" : "/login")}
            style={{ cursor: "pointer" }}
          >
            <img src={feature2} alt="Campus Assistant" />
            <h3>Campus Assistant</h3>
            <p>Connecting students with campus resources easily.</p>
          </div>

          <div 
            className="feature-card"
            onClick={() => navigate(isLoggedIn ? "/feedback" : "/login")}
            style={{ cursor: "pointer" }}
          >
            <img src={feature3} alt="Feedback" />
            <h3>Feedback</h3>
            <p>Help us improve with your feedback.</p>
          </div>

        </section>

        {/* Auth Section */}
        <section className={`auth-section ${showAuth ? "show-auth" : ""}`}>
          <div className="auth-container">

            <div className="auth-left">
              <h2>Welcome to MatchMate</h2>
              <p>Login to access your dashboard.</p>

              <div className="auth-actions">
                <button className="action-button" onClick={() => navigate("/login")}>
                  Login
                </button>

                {/* ✅ FIXED HERE ALSO */}
                <button className="action-button outline" onClick={() => navigate("/signup")}>
                  Register
                </button>

                <button className="close-auth" onClick={() => setShowAuth(false)}>
                  Close
                </button>
              </div>
            </div>

            <div className="auth-right">
              <div className="auth-box">
                <h3>Quick Links</h3>

                <button onClick={() => navigate("/browseitems")} className="quick-btn">
                  Browse Lost & Found items
                </button>

                <button onClick={() => navigate("/campus-assistant")} className="quick-btn">
                  Campus Assistant
                </button>

                <button onClick={() => navigate("/feedback")} className="quick-btn">
                  Give Feedback
                </button>

              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="modern-home-footer">
          <div className="home-footer-content">

            <div className="home-footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/report">Lost & Found</Link></li>
                <li><Link to="/campus-assistant">Campus Assistant</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>

            <div className="home-footer-section">
              <h4>Contact</h4>
              <p>MatchMate Support</p>
              <p>Phone: +94 7X XXX XXXX</p>
              <p>Email: support@matchmate.com</p>
            </div>

          </div>

          <div className="home-footer-bottom">
            <p>© {new Date().getFullYear()} MatchMate. All Rights Reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
}