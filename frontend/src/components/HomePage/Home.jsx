import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaRobot, FaBoxOpen, FaUniversity, FaStar, FaUsers, FaCheck } from "react-icons/fa";
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
                  <div className="hero-content">
                    <h1>Smart Lost & Found Platform</h1>
                    <p>Find lost items, connect with the community, and get support - all in one place</p>
                    
                    <div className="hero-buttons">
                      <button 
                        className="cta-button"
                        onClick={() => navigate("/browseitems")}
                      >
                        Browse Items
                      </button>
                      <button 
                        className="cta-button outline"
                        onClick={() => navigate(isLoggedIn ? "/report" : "/login")}
                      >
                        {isLoggedIn ? "Report Item" : "Sign In"}
                      </button>
                    </div>
                  </div>
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

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <FaBoxOpen />
              </div>
              <div className="stat-content">
                <h4>10,000+</h4>
                <p>Items Listed</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h4>5,000+</h4>
                <p>Active Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaCheck />
              </div>
              <div className="stat-content">
                <h4>95%</h4>
                <p>Recovery Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-header">
            <h2>Our Key Features</h2>
            <p>Everything you need to find and recover lost items</p>
          </div>

          <div className="features-grid">
            <div 
              className="feature-card"
              onClick={() => navigate("/browseitems")}
              role="button"
              tabIndex={0}
            >
              <div className="feature-img-wrapper">
                <img src={feature1} alt="Browse Items" />
                <div className="feature-overlay">
                  <FaBoxOpen size={28} />
                </div>
              </div>
              <h3>Browse Items</h3>
              <p>Smart lost and found system with advanced search capabilities</p>
              <span className="feature-learn-more">Learn more →</span>
            </div>

            <div 
              className="feature-card"
              onClick={() => navigate(isLoggedIn ? "/campus-assistant" : "/login")}
              role="button"
              tabIndex={0}
            >
              <div className="feature-img-wrapper">
                <img src={feature2} alt="Campus Assistant" />
                <div className="feature-overlay">
                  <FaUniversity size={28} />
                </div>
              </div>
              <h3>Campus Assistant</h3>
              <p>Connecting students with campus resources and support services</p>
              <span className="feature-learn-more">Learn more →</span>
            </div>

            <div 
              className="feature-card"
              onClick={() => navigate(isLoggedIn ? "/feedback" : "/login")}
              role="button"
              tabIndex={0}
            >
              <div className="feature-img-wrapper">
                <img src={feature3} alt="Community Support" />
                <div className="feature-overlay">
                  <FaStar size={28} />
                </div>
              </div>
              <h3>Community Feedback</h3>
              <p>Help us grow and improve with your valuable feedback</p>
              <span className="feature-learn-more">Learn more →</span>
            </div>
          </div>
        </section>

        {/* Smart Matching Section */}
        <section className="matching-section">
          <div className="matching-container">
            <div className="matching-content">
              <h2>Smart Matching Technology</h2>
              <p>Our AI-powered system intelligently matches lost items with found items based on description, location, and other factors.</p>
              
              <div className="matching-benefits">
                <div className="benefit-item">
                  <FaCheck className="benefit-icon" />
                  <span>Automatic item matching</span>
                </div>
                <div className="benefit-item">
                  <FaCheck className="benefit-icon" />
                  <span>Real-time notifications</span>
                </div>
                <div className="benefit-item">
                  <FaCheck className="benefit-icon" />
                  <span>Secure communication</span>
                </div>
                <div className="benefit-item">
                  <FaCheck className="benefit-icon" />
                  <span>Community support</span>
                </div>
              </div>

              {isLoggedIn && (
                <button 
                  className="cta-button"
                  onClick={() => navigate("/usermatches")}
                >
                  View Your Matches
                </button>
              )}
            </div>

            <div className="matching-visual">
              <div className="matching-circle"></div>
              <div className="matching-circle-small"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isLoggedIn && (
          <section className="cta-section">
            <div className="cta-content">
              <h2>Join MatchMate Today</h2>
              <p>Register for free and unlock powerful tools to find lost items and help others</p>
              
              <div className="cta-buttons">
                <button 
                  className="cta-button"
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </button>
                <button 
                  className="cta-button outline"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="modern-home-footer">
          <div className="home-footer-content">
            <div className="home-footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/browseitems">Browse Items</Link></li>
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

            <div className="home-footer-section">
              <h4>About</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#privacy">Privacy</a></li>
              </ul>
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