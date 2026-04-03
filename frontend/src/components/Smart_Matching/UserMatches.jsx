import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './UserMatches.css';

// Map color name text to a hex for the small color dot in the UI
const colorToCSS = (colorStr = '') => {
  const map = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
    orange: '#f97316', purple: '#a855f7', pink: '#ec4899', brown: '#92400e',
    black: '#1f2937', white: '#f3f4f6', gray: '#6b7280', grey: '#6b7280',
    silver: '#9ca3af', gold: '#d97706', navy: '#1e3a5f', teal: '#14b8a6',
  };
  const lower = colorStr.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return '#4f8cff';
};

// Shows smart-match results for the logged-in user (or one lost item if lostItemId prop is set)
const UserMatches = ({ lostItemId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedEmail = (loggedUser?.email || '').toLowerCase();

  // Fetch all matches, then keep rows for this user (by lost item id or email on lost item)
  const fetchMyMatches = useCallback(async () => {
    const lostId = lostItemId?._id ?? lostItemId;
    if (!lostId && !loggedEmail) {
      setMatches([]);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('http://localhost:5000/api/smart-match/all-matches');
      const myMatches = res.data.filter((m) => {
        if (lostId) return m.lostItemId?._id === lostId;
        return (m.lostItemId?.userEmail || '').toLowerCase() === loggedEmail;
      });
      setMatches(myMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches', err);
      setLoading(false);
    }
  }, [lostItemId, loggedEmail]);

  // Must be logged in (unless viewing a specific lost item via prop); then load matches
  useEffect(() => {
    if (!lostItemId && !loggedEmail) {
      navigate('/login');
      return;
    }
    fetchMyMatches();
  }, [fetchMyMatches, lostItemId, loggedEmail, navigate]);

  const apiBaseUrl = API.defaults.baseURL || '';

  const resolveImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${apiBaseUrl}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${apiBaseUrl}/${imagePath}`;
    return `${apiBaseUrl}/uploads/${imagePath}`;
  };

  // Loading state while fetching
  if (loading) {
    return (
      <div className="user-matches-container">
        <div className="loader">
          <div className="loader-ring" />
          Searching for matches…
        </div>
      </div>
    );
  }

  // Title text: prop, first match’s lost item, or generic
  const lostItemName =
    lostItemId?.itemName ?? matches[0]?.lostItemId?.itemName ?? 'your item';

  return (
    <div className="user-matches-container">

      {/* ── Hero ── */}
      <div className="matches-hero">
        <div className="matches-hero-icon">🔍</div>
        <div className="matches-hero-text">
          <h3>Potential Matches</h3>
          <p>
            Smart results for <span>"{lostItemName}"</span> — ranked by name,
            category, color &amp; location similarity.
          </p>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="match-grid">
        {matches.length > 0 ? (
          matches.map((match) => {
            const item    = match.foundItemId || {};
            const imgSrc  = resolveImageSrc(item.image);
            const score   = match.matchScore ?? 0;
            const isHigh  = score >= 80;

            return (
              <div key={match._id} className="match-card">

                {/* Score badge */}
                <div className={`score-badge${isHigh ? ' high' : ''}`}>
                  {score}% Match
                </div>

                {/* Image */}
                <div className="match-card-image-wrap">
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.itemName || 'Found item'} />
                  ) : (
                    <div className="match-card-img-placeholder">
                      <span className="placeholder-icon">📦</span>
                      No image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="match-details">
                  <h4>{item.itemName || 'Unknown item'}</h4>

                  {/* Score bar */}
                  <div className="match-score-bar-wrap">
                    <div className="match-score-bar-label">
                      <span>Match confidence</span>
                      <span>{score}%</span>
                    </div>
                    <div className="match-score-bar-track">
                      <div
                        className="match-score-bar-fill"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Pill details */}
                  <div className="match-pills">
                    {item.location && (
                      <div className="match-pill">
                        <span className="match-pill-icon">📍</span>
                        <span><strong>Found at</strong> {item.location}</span>
                      </div>
                    )}
                    {item.color && (
                      <div className="match-pill">
                        <span className="match-pill-icon">🎨</span>
                        <span>
                          <span
                            className="color-dot"
                            style={{ background: colorToCSS(item.color) }}
                          />
                          <strong>{item.color}</strong>
                        </span>
                      </div>
                    )}
                    {item.category && (
                      <div className="match-pill">
                        <span className="match-pill-icon">🏷️</span>
                        <span><strong>{item.category}</strong></span>
                      </div>
                    )}
                  </div>

                  <button className="claim-btn">That's Mine!</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="match-empty-state">
            <div className="empty-icon">🔭</div>
            <h4>No matches yet</h4>
            <p>
              We're still scanning reported found items. You'll be notified as
              soon as a strong match appears.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMatches;