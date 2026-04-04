import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './UserMatches.css';

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

const UserMatches = ({ lostItemId }) => {
  const [asLostOwner, setAsLostOwner] = useState([]);
  const [asFoundOwner, setAsFoundOwner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [respondModal, setRespondModal] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedEmail = (loggedUser?.email || '').trim().toLowerCase();
  const defaultDisplayName =
    (loggedUser?.name || loggedUser?.fullName || loggedUser?.username || '').trim();

  const fetchMyMatches = useCallback(async () => {
    const lostId = lostItemId?._id ?? lostItemId;
    if (!lostId && !loggedEmail) {
      setAsLostOwner([]);
      setAsFoundOwner([]);
      setLoading(false);
      return;
    }
    try {
      if (lostId) {
        const res = await API.get('/api/smart-match/all-matches');
        const rows = Array.isArray(res.data) ? res.data : [];
        const mine = rows.filter((m) => {
          const okLost = lostId
            ? String(m.lostItemId?._id) === String(lostId)
            : (m.lostItemId?.userEmail || '').toLowerCase() === loggedEmail;
          const notRejected = (m.lostOwnerResponse || 'none') !== 'rejected';
          return okLost && notRejected;
        });
        setAsLostOwner(mine);
        setAsFoundOwner([]);
      } else {
        const res = await API.get(
          `/api/smart-match/user-matches?email=${encodeURIComponent(loggedEmail)}`
        );
        setAsLostOwner(res.data?.asLostOwner || []);
        setAsFoundOwner(res.data?.asFoundOwner || []);
      }
    } catch (err) {
      console.error('Error fetching matches', err);
    } finally {
      setLoading(false);
    }
  }, [lostItemId, loggedEmail]);

  useEffect(() => {
    if (!lostItemId && !loggedEmail) {
      navigate('/login');
      return;
    }
    fetchMyMatches();
  }, [fetchMyMatches, lostItemId, loggedEmail, navigate]);

  useEffect(() => {
    if (lostItemId || !loggedEmail) return undefined;
    const id = setInterval(() => {
      fetchMyMatches();
    }, 20000);
    return () => clearInterval(id);
  }, [lostItemId, loggedEmail, fetchMyMatches]);

  const openRespondModal = (mode, matchId) => {
    setContactName(defaultDisplayName);
    setContactPhone('');
    setRespondModal({ mode, matchId });
  };

  const closeRespondModal = () => {
    setRespondModal(null);
  };

  const submitRespondModal = async () => {
    if (!respondModal || !loggedEmail) return;
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (name.length < 2) {
      alert('Please enter your full name (at least 2 characters).');
      return;
    }
    const { matchId, mode } = respondModal;
    setBusyId(matchId);
    try {
      const payload = {
        email: loggedEmail,
        ownerName: name,
        ownerPhone: phone,
      };
      if (mode === 'claim') {
        const { data } = await API.post(`/api/smart-match/claim/${matchId}`, payload);
        alert(data?.message || 'Saved.');
      } else {
        const { data } = await API.post(`/api/smart-match/reject/${matchId}`, payload);
        alert(data?.message || 'Recorded.');
      }
      closeRespondModal();
      await fetchMyMatches();
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          'Request failed'
      );
    } finally {
      setBusyId(null);
    }
  };

  const apiBaseUrl = API.defaults.baseURL || '';

  const resolveImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${apiBaseUrl}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${apiBaseUrl}/${imagePath}`;
    return `${apiBaseUrl}/uploads/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="user-matches-container user-matches-container--loading">
        <div className="loader">
          <div className="loader-ring" />
          <span className="loader-text">Loading your matches…</span>
        </div>
      </div>
    );
  }

  const lostItemName =
    lostItemId?.itemName ?? asLostOwner[0]?.lostItemId?.itemName ?? 'your item';

  return (
    <div className="user-matches-container">
      <div className="user-matches-inner">
      <header className="matches-hero">
        <div className="matches-hero-brand" aria-hidden="true">
          <span className="matches-hero-brand-mark" />
        </div>
        <div className="matches-hero-body">
          <span className="matches-hero-kicker">Smart recovery</span>
          <h1 className="matches-hero-title">Your matches</h1>
          <p className="matches-hero-lead">
            Showing results for <span className="matches-hero-item">{lostItemName}</span>.
            After the office notifies you, choose <strong>That&apos;s mine</strong> or <strong>Not mine</strong> and
            share contact details (shared with admin and the finder when you confirm).
          </p>
          <ol className="matches-hero-steps">
            <li><span className="matches-hero-step-num">1</span> Office notifies you</li>
            <li><span className="matches-hero-step-num">2</span> Review the found report</li>
            <li><span className="matches-hero-step-num">3</span> Confirm or decline</li>
          </ol>
        </div>
      </header>

      {asLostOwner.length > 0 && (
        <h2 className="user-matches-section-title">
          <span className="user-matches-section-line" aria-hidden="true" />
          Possible matches for your lost item
        </h2>
      )}
      <div className="match-grid">
        {asLostOwner.length > 0 ? (
          asLostOwner.map((match) => {
            const item = match.foundItemId || {};
            const imgSrc = resolveImageSrc(item.image);
            const score = match.matchScore ?? 0;
            const isHigh = score >= 80;
            const response = match.lostOwnerResponse || 'none';
            const claimed = response === 'claimed' && match.lostUserClaimed;
            const notified = match.status === 'notified';
            const canClaim = notified && response === 'none' && !match.lostUserClaimed;
            const canReject = response === 'none' && !match.lostUserClaimed;
            const c = match.lostOwnerContact || {};

            return (
              <article key={match._id} className="match-card">
                <div
                  className={`match-card-ribbon match-card-ribbon--${
                    claimed ? 'claimed' : notified ? 'ready' : 'await'
                  }`}
                >
                  {claimed ? 'Confirmed' : notified ? 'Action needed' : 'Awaiting notify'}
                </div>

                {notified && canReject && (
                  <div className="in-app-notify-banner">
                    <span className="banner-dot" aria-hidden="true" />
                    Office notified you — review this match and choose an action below.
                  </div>
                )}
                {claimed && (
                  <div className="in-app-claimed-banner">
                    You confirmed this as yours. Admin and the finder can see your contact details below.
                    {c.name ? (
                      <div className="match-contact-shared">
                        <div className="match-contact-shared-label">Your shared contact</div>
                        <div className="match-contact-shared-row">
                        <strong>{c.name}</strong>
                        {c.email ? <span className="match-contact-sep">{c.email}</span> : null}
                        {c.phone ? <span className="match-contact-sep">{c.phone}</span> : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="match-card-image-wrap">
                  <div className={`score-badge${isHigh ? ' high' : ''}`}>{score}% match</div>
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.itemName || 'Found item'} />
                  ) : (
                    <div className="match-card-img-placeholder">
                      <span className="placeholder-icon">📦</span>
                      No image
                    </div>
                  )}
                </div>

                <div className="match-details">
                  <h4>{item.itemName || 'Unknown item'}</h4>

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

                  {!notified && canReject && (
                    <p className="match-wait-hint">
                      Wait for the office to notify you before you can confirm &quot;That&apos;s mine&quot;.
                      You can still choose &quot;Not mine&quot; anytime.
                    </p>
                  )}

                  <div className="match-actions-row">
                    <button
                      type="button"
                      className="claim-btn"
                      disabled={!canClaim || busyId === match._id}
                      title={!notified ? 'Available after office notification' : ''}
                      onClick={() => openRespondModal('claim', match._id)}
                    >
                      {busyId === match._id ? '…' : "That's mine"}
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      disabled={!canReject || busyId === match._id}
                      onClick={() => openRespondModal('reject', match._id)}
                    >
                      Not mine
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="match-empty-state">
            <div className="empty-icon" aria-hidden="true" />
            <h3 className="match-empty-title">No matches yet</h3>
            <p className="match-empty-desc">
              When the system finds a strong match, it will appear here. After the office notifies you,
              you can confirm or dismiss.
            </p>
          </div>
        )}
      </div>

      {asFoundOwner.length > 0 && (
        <>
          <h2 className="user-matches-section-title user-matches-section-title--spaced">
            <span className="user-matches-section-line" aria-hidden="true" />
            Your found reports — owner confirmed
          </h2>
          <div className="match-grid">
            {asFoundOwner.map((match) => {
              const lost = match.lostItemId || {};
              const found = match.foundItemId || {};
              const imgSrc = resolveImageSrc(lost.image);
              const loc = match.lostOwnerContact || {};
              return (
                <article key={match._id} className="match-card match-card--found-notify">
                  <div className="match-card-ribbon match-card-ribbon--finder">Owner confirmed</div>
                  <div className="in-app-notify-banner in-app-notify-banner--finder">
                    <span className="banner-dot banner-dot--finder" aria-hidden="true" />
                    A lost-item owner confirmed with &quot;That&apos;s mine&quot;. Use the details below to arrange
                    handover. Admin can also see this information.
                  </div>
                  <div className="match-card-image-wrap">
                    {imgSrc ? (
                      <img src={imgSrc} alt={lost.itemName || 'Lost item'} />
                    ) : (
                      <div className="match-card-img-placeholder">
                        <span className="placeholder-icon">📦</span>
                        No image
                      </div>
                    )}
                  </div>
                  <div className="match-details">
                    <h4>Lost item: {lost.itemName || '—'}</h4>
                    <p className="match-found-pair">
                      Your found report: <strong>{found.itemName || '—'}</strong>
                    </p>
                    {(loc.name || loc.email || loc.phone) && (
                      <div className="finder-contact-box">
                        <div className="finder-contact-title">Lost-item owner</div>
                        {loc.name ? <div className="finder-contact-name">{loc.name}</div> : null}
                        {loc.email ? <div className="finder-contact-line">{loc.email}</div> : null}
                        {loc.phone ? <div className="finder-contact-line">{loc.phone}</div> : null}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {respondModal && (
        <div
          className="respond-modal-overlay"
          role="presentation"
          onClick={closeRespondModal}
        >
          <div
            className="respond-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="respond-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="respond-modal-header">
              <h3 id="respond-modal-title" className="respond-modal-title">
                {respondModal.mode === 'claim'
                  ? "Confirm it's yours"
                  : 'Decline this match'}
              </h3>
              <p className="respond-modal-sub">
                {respondModal.mode === 'claim'
                  ? 'Your name, email, and optional phone are shared with the finder and admin.'
                  : 'Your details help admin record who declined this match.'}
              </p>
            </div>
            <div className="respond-modal-fields">
            <label className="respond-modal-label" htmlFor="um-email">Email (account)</label>
            <input id="um-email" className="respond-modal-input respond-modal-input--readonly" type="email" value={loggedEmail} readOnly />
            <label className="respond-modal-label" htmlFor="um-name">Full name</label>
            <input
              id="um-name"
              className="respond-modal-input"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
            />
            <label className="respond-modal-label" htmlFor="um-phone">Phone (optional)</label>
            <input
              id="um-phone"
              className="respond-modal-input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Phone or WhatsApp"
              autoComplete="tel"
            />
            </div>
            <div className="respond-modal-actions">
              <button type="button" className="respond-modal-cancel" onClick={closeRespondModal}>
                Cancel
              </button>
              <button
                type="button"
                className={
                  respondModal.mode === 'claim' ? 'respond-modal-submit' : 'respond-modal-submit danger'
                }
                onClick={submitRespondModal}
                disabled={Boolean(busyId)}
              >
                {respondModal.mode === 'claim' ? 'Submit confirmation' : 'Submit decline'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserMatches;
