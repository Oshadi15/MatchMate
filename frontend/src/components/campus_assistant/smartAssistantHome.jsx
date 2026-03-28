import React from "react";
import { useNavigate } from "react-router-dom";
import "./smartAssistantHome.css";
import locationImg from "../../assets/location.jpg";
import helpBoardImg from "../../assets/helpboard.jpg";

export default function CampusAssistantHome() {
  const navigate = useNavigate();

  return (
    <div className="ca-page">
      <header className="ca-header">
        <div className="ca-header-inner">
          <div className="ca-brand">
            <div className="ca-bot">🤖</div>
            <h1 className="ca-title">
              Campus <span className="ca-title-accent">Assistant</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="ca-content">
        <div className="ca-cards">
          <button
            className="ca-card"
           onClick={() => navigate("/create")}
            type="button"
          >
            <div className="ca-card-body">
              <h2 className="ca-card-title">Campus Location Finder</h2>
              <div className="ca-card-imageWrap">
                <img
                  src={locationImg}
                  alt="Campus Location Finder"
                  className="ca-card-imageFull"
                />
              </div>
            </div>
            <div className="ca-card-footer">Find locations on campus</div>
          </button>

          <button
            className="ca-card"
            onClick={() => navigate("/create")}
            type="button"
          >
            <div className="ca-card-body">
              <h2 className="ca-card-title">Student Help Board</h2>
              <div className="ca-card-imageWrap">
                <img
                  src={helpBoardImg}
                  alt="Student Help Board"
                  className="ca-card-imageFull"
                />
              </div>
            </div>
            <div className="ca-card-footer">Request help or assistance</div>
          </button>
        </div>

        <div className="ca-notes">
          <div className="ca-notes-header">
            <h3 className="ca-notes-title">Guidelines</h3>
            <span className="ca-notes-sub">Please read before submitting a request</span>
          </div>

          <div className="ca-notes-grid">
            <div className="ca-note">
              <div className="ca-note-title">Use the correct feature</div>
              <div className="ca-note-text">
                Campus Location Finder is for finding places on campus. Student Help Board is for asking admin questions.
              </div>
            </div>

            <div className="ca-note">
              <div className="ca-note-title">Not for Lost &amp; Found</div>
              <div className="ca-note-text">
                If you lost or found an item, please submit it through the Lost &amp; Found module.
              </div>
            </div>

            <div className="ca-note">
              <div className="ca-note-title">Request status</div>
              <div className="ca-note-text">
                OPEN: submitted • IN_PROGRESS: being reviewed • RESOLVED: completed
              </div>
            </div>

            <div className="ca-note">
              <div className="ca-note-title">Privacy &amp; safety</div>
              <div className="ca-note-text">
                Do not share passwords, NIC numbers, or payment details. For urgent safety issues, contact campus security.
              </div>
            </div>

            <div className="ca-note ca-note-wide">
              <div className="ca-note-title">Map accuracy</div>
              <div className="ca-note-text">
                Locations are based on the latest campus information. If you notice an incorrect location, report it to admin.
              </div>
            </div>
          </div>

          <div className="ca-footer">
            <span>© 2026 MatchMate Campus Assistant</span>
            <span className="ca-footer-dot">•</span>
            <span>Support: Admin Office / IT Help Desk</span>
          </div>
        </div>
      </main>
    </div>
  );
}