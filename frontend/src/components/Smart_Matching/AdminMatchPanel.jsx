import React, { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../../services/api';
import './AdminMatchPanel.css';
import { useNavigate } from 'react-router-dom';

/**
 * VALIDATION: Clamp a number to range [0, 1]
 * Ensures a ratio/percentage (0-1) is within valid bounds
 * Returns null if input is not a valid finite number
 * Used for: Image similarity scores (0.0 to 1.0)
 * @param {number} n - Input number to clamp
 * @returns {number|null} - Clamped value [0, 1] or null if invalid
 */
function clamp01(n) {
  // VALIDATION: Check if number is valid and finite
  if (!Number.isFinite(n)) return null;
  // VALIDATION: Clamp to valid range [0, 1]
  return Math.max(0, Math.min(1, n));
}

/**
 * VALIDATION & MAPPING: Convert AI status code to display pill info
 * Maps backend imageAiStatus values to UI-friendly labels and CSS classes
 * Used to display visual indicators for AI scoring status
 * 
 * Valid statuses:
 *   - 'scored': AI has calculated image similarity (green)
 *   - 'pending_ai': Waiting for admin to run AI check (blue)
 *   - 'missing_image': No image(s) to compare (gray)
 *   - 'file_not_found', 'image_url_error': Image loading failed (gray)
 *   - 'hf_error': AI model error (red)
 *   - Other/unknown: Placeholder (muted)
 * 
 * @param {string} status - AI status from match object
 * @returns {Object} - { label: string, cls: string } for display
 */
function getAiStatusPill(status) {
  switch (status) {
    // VALIDATION: AI successfully scored images
    case 'scored':
      return { label: 'Scored', cls: 'ai-pill ai-pill--ok' };
    // VALIDATION: Waiting for admin to run AI scoring
    case 'pending_ai':
      return { label: 'Pending', cls: 'ai-pill ai-pill--pending' };
    // VALIDATION: No image(s) available for comparison
    case 'missing_image':
      return { label: 'No photo', cls: 'ai-pill ai-pill--skip' };
    // VALIDATION: Image file not found or URL error
    case 'file_not_found':
    case 'image_url_error':
      return { label: 'Image issue', cls: 'ai-pill ai-pill--skip' };
    // VALIDATION: AI model/Hugging Face API error
    case 'hf_error':
      return { label: 'AI error', cls: 'ai-pill ai-pill--err' };
    // VALIDATION: Unknown or unmapped status
    default:
      return { label: '—', cls: 'ai-pill ai-pill--muted' };
  }
}

const AdminMatchPanel = () => {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ loading: false, msg: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall_desc');
  const [ownerFilter, setOwnerFilter] = useState('all');

  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = loggedUser?.role === 'admin';

  const apiBaseUrl = API.defaults.baseURL || '';

  const pendingCount = useMemo(() => matches.filter((m) => m.status === 'pending').length, [matches]);
  const notifiedCount = useMemo(() => matches.filter((m) => m.status === 'notified').length, [matches]);
  const awaitingAiCount = useMemo(() => matches.filter((m) => m.imageAiStatus === 'pending_ai').length, [matches]);

  const fetchMatches = useCallback(async () => {
    const res = await API.get('/api/smart-match/all-matches');
    setMatches(Array.isArray(res.data) ? res.data : []);
  }, []);

  const runMatching = async () => {
    setStats({ loading: true, msg: 'Scoring local input data (0–100%)…' });
    try {
      const res = await API.post('/api/smart-match/run-match');
      setStats({
        loading: false,
        msg: `✓ Input scoring saved. ${res.data.matchesFound || 0} new, ${res.data.matchesUpdated || 0} updated.`,
      });
      fetchMatches();
    } catch (e) {
      setStats({ loading: false, msg: '' });
      alert('Input scoring failed.');
      console.error(e);
    }
  };

  const runAiImageCheck = async () => {
    setStats({ loading: true, msg: 'Running AI image check (0–100%)…' });
    try {
      const res = await API.post('/api/smart-match/run-image-ai');
      setStats({
        loading: false,
        msg: `✓ AI done. Processed ${res.data.processed || 0}, scored ${res.data.aiScoredOk || 0}.`,
      });
      fetchMatches();
    } catch (e) {
      setStats({ loading: false, msg: '' });
      alert('AI image check failed.');
      console.error(e);
    }
  };

  const deleteAllMatches = async () => {
    const ok = window.confirm('Delete ALL matches? This cannot be undone.');
    if (!ok) return;
    setStats({ loading: true, msg: 'Deleting all matches…' });
    try {
      await API.delete('/api/smart-match/delete/all');
      setStats({ loading: false, msg: '✓ All matches deleted.' });
      fetchMatches();
    } catch (e) {
      setStats({ loading: false, msg: '' });
      alert('Failed to delete all matches.');
      console.error(e);
    }
  };

  const deleteMatch = async (id) => {
    await API.delete(`/api/smart-match/${id}`);
    fetchMatches();
  };

  /**
   * VALIDATION & HANDLER: Notify lost item owner about a match
   * 
   * Process:
   *   1. Get match ID and find corresponding row in matches array
   *   2. Check if lost item already has email on file
   *   3. If no email: prompt admin to enter owner's email
   *   4. VALIDATE email is not empty (required)
   *   5. Send notification request to backend
   *   6. Refresh matches list to show updated status
   * 
   * @param {string} id - Match ID to notify
   */
  const handleNotify = async (id) => {
    // VALIDATION: Convert ID to string for consistent comparison
    const matchId = String(id);
    
    // Query: Find the match row by ID
    const row = matches.find((m) => String(m._id) === matchId);
    
    // VALIDATION: Check if lost item already has email on file
    const existingEmail = (row?.lostItemId?.userEmail || '').trim();
    let email = existingEmail;
    
    if (!email) {
      // VALIDATION: No existing email - prompt admin to enter owner's email
      const entered = window.prompt(
        'This lost report has no email on file. Enter the owner account email so they can see this in Smart Matches:',
        ''
      );
      
      // VALIDATION: User cancelled prompt
      if (entered == null) return;
      
      // VALIDATION: Trim whitespace from entered email
      email = String(entered).trim();
      
      // VALIDATION: Email cannot be empty
      if (!email) {
        alert('A valid email is required so the owner can see matches in Smart Matches.');
        return;
      }
    }
    
    try {
      // PAYLOAD: Only send email if we're overriding (no existing email)
      const payload = existingEmail ? {} : { email };
      
      // API: Send notification request to backend
      await API.post(`/api/smart-match/notify/${matchId}`, payload);
      
      // SUCCESS: User will see match in their Smart Matches dashboard
      alert('User will see this on their Smart Matches page.');
      
      // REFRESH: Update matches list to reflect notified status
      fetchMatches();
    } catch (e) {
      // ERROR HANDLING: Show backend error message or fallback error
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to send notification';
      alert(msg);
    }
  };

  /**
   * HANDLER: Open item details modal
   * VALIDATION: Ensure item exists before opening
   * @param {Object} item - Lost or found item to display
   * @param {string} type - Item type: 'Lost Item' or 'Found Item'
   */
  const openItemDetails = (item, type) => {
    // VALIDATION: Must have item object before opening
    if (!item) return;
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  /**
   * HANDLER: Close item details modal
   */
  const closeItemDetails = () => {
    setSelectedItem(null);
    setSelectedItemType('');
  };

  /**
   * VALIDATION: Resolve image path to full URL
   * Handles multiple image source formats:
   *   - Full URL (http/https): use as-is
   *   - Server path (/uploads/...): prepend API base URL
   *   - Relative path (uploads/...): prepend API base URL with /
   *   - No path: return empty string
   * 
   * @param {string} imagePath - Image path from database
   * @returns {string} - Full resolvable URL or empty string
   */
  const resolveImageSrc = (imagePath) => {
    // VALIDATION: No path returns empty string
    if (!imagePath) return '';
    
    // VALIDATION: Already a full URL - use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    
    // VALIDATION: Server path with leading slash
    if (imagePath.startsWith('/uploads/')) return `${apiBaseUrl}${imagePath}`;
    
    // VALIDATION: Relative path without leading slash
    if (imagePath.startsWith('uploads/')) return `${apiBaseUrl}/${imagePath}`;
    
    // VALIDATION: Fallback - assume path is filename only, prepend full uploads path
    return `${apiBaseUrl}/uploads/${imagePath}`;
  };

  /**
   * VALIDATION & FILTERING: Filter and sort matches based on user selections
   * 
   * Filters applied:
   *   - Search text: match item names or categories (case-insensitive)
   *   - Status filter: pending, notified, resolved
   *   - AI filter: AI scored, pending AI, AI issues
   *   - Owner response filter: no answer, claimed (that's mine), rejected (not mine)
   * 
   * Sort options:
   *   - Overall score: high to low (default)
   *   - Input score: high to low
   *   - Image score: high to low
   *   - Latest updated: newest first
   */
  const filteredMatches = useMemo(() => {
    // VALIDATION: Search text - normalize to lowercase and trim
    const q = searchText.trim().toLowerCase();
    
    // FILTERING: Apply all selected filters
    let out = matches.filter((m) => {
      // VALIDATION: Status filter - must match selected status
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      
      // VALIDATION: AI status filter - check image AI scoring status
      if (aiFilter !== 'all') {
        // VALIDATION: Filter for scored AI (image similarity calculated)
        if (aiFilter === 'scored' && m.imageAiStatus !== 'scored') return false;
        // VALIDATION: Filter for pending AI (not yet scored)
        if (aiFilter === 'pending' && m.imageAiStatus !== 'pending_ai') return false;
        // VALIDATION: Filter for AI issues (errors or missing images)
        if (
          aiFilter === 'issue' &&
          !['hf_error', 'file_not_found', 'image_url_error', 'missing_image'].includes(m.imageAiStatus)
        ) {
          return false;
        }
      }
      
      // VALIDATION: Owner response filter - check how (if) owner responded
      if (ownerFilter !== 'all') {
        const r = m.lostOwnerResponse || 'none';
        if (ownerFilter !== r) return false;
      }
      
      // VALIDATION: If no search text provided, match passes all filters
      if (!q) return true;
      
      // VALIDATION: Search text matching - case-insensitive
      // Search across: lost item name, found item name, lost category, found category
      const lostName = (m?.lostItemId?.itemName || '').toLowerCase();
      const foundName = (m?.foundItemId?.itemName || '').toLowerCase();
      const lostCat = (m?.lostItemId?.category || '').toLowerCase();
      const foundCat = (m?.foundItemId?.category || '').toLowerCase();
      
      // Return true if search query is found in ANY of the fields
      return [lostName, foundName, lostCat, foundCat].some((v) => v.includes(q));
    });

    // SORTING: Create copy and sort by selected criteria
    out = [...out].sort((a, b) => {
      // VALIDATION: Extract scores with fallbacks for backward compatibility
      // Overall score (newest field)
      const aOverall = Number(a.overallScore ?? a.matchScore ?? 0);
      const bOverall = Number(b.overallScore ?? b.matchScore ?? 0);
      
      // Input score (form fields only)
      const aInput = Number(a.inputScore ?? a.ruleScore ?? 0);
      const bInput = Number(b.inputScore ?? b.ruleScore ?? 0);
      
      // Image score (AI similarity)
      const aImg = Number(a.imageScore ?? 0);
      const bImg = Number(b.imageScore ?? 0);
      
      // Timestamp for sorting by recency
      const aT = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bT = new Date(b.updatedAt || b.createdAt || 0).getTime();

      // VALIDATION: Sort by selected criteria
      switch (sortBy) {
        // SORT: Overall score ascending (low to high)
        case 'overall_asc': return aOverall - bOverall;
        // SORT: Overall score descending (high to low) - default
        case 'overall_desc': return bOverall - aOverall;
        // SORT: Input score descending (form fields, high to low)
        case 'input_desc': return bInput - aInput;
        // SORT: Image score descending (AI, high to low)
        case 'image_desc': return bImg - aImg;
        // SORT: Latest updated matches first (newest first)
        case 'latest': return bT - aT;
        // DEFAULT: Overall score descending
        default: return bOverall - aOverall;
      }
    });

    return out;
  }, [matches, searchText, statusFilter, aiFilter, sortBy, ownerFilter]);

  /**
   * EFFECT: Verify user is admin and has permission to view admin panel
   * Redirects non-admin users to their dashboard
   * Loads matches on component mount
   */
  useEffect(() => {
    // VALIDATION: Check if current user is admin
    // Only admin should be allowed to view all matches
    if (!isAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // LOAD: Fetch matches from backend
    fetchMatches();
  }, [fetchMatches, isAdmin, navigate]);

  /**
   * EFFECT: Set up live refresh interval for real-time updates
   * Auto-refreshes match list every 20 seconds for admin panel
   * Only runs if user is admin
   */
  useEffect(() => {
    // VALIDATION: Only set interval if user is admin
    if (!isAdmin) return;
    
    // REFRESH: Auto-fetch matches every 20 seconds (20000ms) for live updates
    const t = window.setInterval(() => {
      fetchMatches();
    }, 20000);
    return () => window.clearInterval(t);
  }, [isAdmin, fetchMatches]);

  return (
    <div className="admin-panel">
      <div className="admin-panel-inner">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-badge" aria-hidden="true">
            <span className="admin-header-badge-icon" />
          </div>
          <div className="admin-header-text">
            <span className="admin-header-kicker">Admin · Smart matching</span>
            <h1 className="admin-header-title">Matching control center</h1>
            <p className="admin-header-desc">
              Overall score = (Input × 0.6) + (AI image × 0.4). Run scoring, then AI review, then notify owners.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <span className="admin-sync-pill" title="List refreshes automatically every 20 seconds">
            <span className="admin-sync-dot" /> Live sync
          </span>
          <button type="button" onClick={runMatching} disabled={stats.loading} className="run-btn">
            {stats.loading ? <><div className="run-btn-spinner" /> Processing…</> : <>Run input scoring</>}
          </button>
          <button type="button" onClick={runAiImageCheck} disabled={stats.loading} className="ai-image-btn">
            AI image check
          </button>
          <button type="button" onClick={deleteAllMatches} disabled={stats.loading} className="delete-all-btn">
            Clear all
          </button>
        </div>
      </header>

      <section className="admin-metrics admin-metrics-4" aria-label="Match statistics">
        <div className="metric-card metric-card--total">
          <div className="metric-card-top">
            <span className="metric-card-label">Total matches</span>
            <div className="metric-card-icon total" aria-hidden="true" />
          </div>
          <strong>{matches.length}</strong>
          <div className="metric-card-accent total" />
        </div>
        <div className="metric-card metric-card--pending">
          <div className="metric-card-top">
            <span className="metric-card-label">Pending</span>
            <div className="metric-card-icon pending" aria-hidden="true" />
          </div>
          <strong>{pendingCount}</strong>
          <div className="metric-card-accent pending" />
        </div>
        <div className="metric-card metric-card--aiwait">
          <div className="metric-card-top">
            <span className="metric-card-label">Awaiting AI</span>
            <div className="metric-card-icon aiwait" aria-hidden="true" />
          </div>
          <strong>{awaitingAiCount}</strong>
          <div className="metric-card-accent aiwait" />
        </div>
        <div className="metric-card metric-card--notified">
          <div className="metric-card-top">
            <span className="metric-card-label">Notified</span>
            <div className="metric-card-icon notified" aria-hidden="true" />
          </div>
          <strong>{notifiedCount}</strong>
          <div className="metric-card-accent notified" />
        </div>
      </section>

      <div className="admin-actions">
        {stats.msg && <p className="status-msg" role="status">{stats.msg}</p>}
      </div>

      <div className="table-section">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <h2 className="table-toolbar-title">Match results</h2>
          <p className="table-toolbar-sub">Filter, sort, and review owner responses.</p>
        </div>
        <span className="table-toolbar-meta">{filteredMatches.length} of {matches.length} shown</span>
      </div>

      <div className="table-filters" role="search">
        <input
          type="text"
          className="table-filter-input"
          placeholder="Search item name or category…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select className="table-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="notified">Notified</option>
          <option value="resolved">Resolved</option>
        </select>
        <select className="table-filter-select" value={aiFilter} onChange={(e) => setAiFilter(e.target.value)}>
          <option value="all">All AI</option>
          <option value="scored">AI scored</option>
          <option value="pending">AI pending</option>
          <option value="issue">AI issues</option>
        </select>
        <select className="table-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="overall_desc">Sort: overall high → low</option>
          <option value="overall_asc">Sort: overall low → high</option>
          <option value="input_desc">Sort: input high → low</option>
          <option value="image_desc">Sort: image high → low</option>
          <option value="latest">Sort: latest updated</option>
        </select>
        <select className="table-filter-select" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
          <option value="all">Owner: any</option>
          <option value="none">Owner: no answer yet</option>
          <option value="claimed">Owner: claimed (that's mine)</option>
          <option value="rejected">Owner: not mine</option>
        </select>
      </div>

      <div className="table-wrap table-wrap-scroll">
        <table className="match-table">
          <thead className="match-table-head">
            <tr>
              <th>Lost</th>
              <th>Found</th>
              <th>Input</th>
              <th>Image</th>
              <th>Overall</th>
              <th>Photos / AI</th>
              <th>Status</th>
              <th>Lost owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="9">
                  <div className="empty-row-inner">
                    <div className="empty-row-icon" aria-hidden="true" />
                    <span className="empty-row-title">No rows match</span>
                    <span className="empty-row-hint">Adjust filters or run input scoring to populate results.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMatches.map((m) => {
                const input = typeof m.inputScore === 'number' ? m.inputScore : (m.ruleScore ?? 0);
                const img = typeof m.imageScore === 'number' ? m.imageScore : 0;
                const overall = typeof m.overallScore === 'number' ? m.overallScore : (m.matchScore ?? 0);
                const showOverall = m.imageAiStatus === 'scored';
                const sim01 = clamp01(Number(m.imageSimilarity));
                const pill = getAiStatusPill(m.imageAiStatus);

                const lost = m.lostItemId || null;
                const found = m.foundItemId || null;
                const lostSrc = lost?.image ? resolveImageSrc(lost.image) : '';
                const foundSrc = found?.image ? resolveImageSrc(found.image) : '';
                const ownerResp = m.lostOwnerResponse || 'none';
                const oc = m.lostOwnerContact || {};
                const ownerPill =
                  ownerResp === 'claimed'
                    ? { cls: 'owner-pill owner-pill--claimed', label: 'Claimed' }
                    : ownerResp === 'rejected'
                      ? { cls: 'owner-pill owner-pill--rejected', label: 'Not mine' }
                      : { cls: 'owner-pill owner-pill--none', label: 'No answer' };
                const ownerWhen = m.lostOwnerRespondedAt
                  ? new Date(m.lostOwnerRespondedAt).toLocaleString()
                  : null;

                return (
                  <tr key={m._id}>
                    <td>
                      <button type="button" className="item-link-btn" onClick={() => openItemDetails(lost, 'Lost Item')}>
                        {lost?.itemName || 'N/A'}
                      </button>
                      {lost?.category && <div className="row-sub">{lost.category}</div>}
                    </td>
                    <td>
                      <button type="button" className="item-link-btn" onClick={() => openItemDetails(found, 'Found Item')}>
                        {found?.itemName || 'N/A'}
                      </button>
                      {found?.category && <div className="row-sub">{found.category}</div>}
                    </td>
                    <td><span className="table-score">{input}%</span></td>
                    <td><span className="table-score">{img}%</span></td>
                    <td>
                      {showOverall
                        ? <span className="table-score">{overall}%</span>
                        : <span className="image-chip muted">—</span>}
                    </td>
                    <td className="image-cell-td">
                      <div className="image-cell">
                        <div className="image-cell-thumbs">
                          <div className="image-cell-thumb-wrap">
                            <span className="thumb-label">L</span>
                            {lostSrc ? <img src={lostSrc} alt="" className="image-cell-thumb" /> : <span className="image-cell-thumb-placeholder">—</span>}
                          </div>
                          <div className="image-cell-thumb-wrap">
                            <span className="thumb-label">F</span>
                            {foundSrc ? <img src={foundSrc} alt="" className="image-cell-thumb" /> : <span className="image-cell-thumb-placeholder">—</span>}
                          </div>
                        </div>
                        <div className="image-cell-ai">
                          <span className={pill.cls}>{pill.label}</span>
                          {sim01 != null ? <span className="image-chip">{Math.round(sim01 * 100)}%</span> : <span className="image-chip muted">—</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${m.status}`}>{m.status}</span>
                    </td>
                    <td className="owner-cell">
                      <span className={ownerPill.cls}>{ownerPill.label}</span>
                      {(ownerResp === 'claimed' || ownerResp === 'rejected') && (
                        <div className="owner-contact-line">
                          {[oc.name, oc.email, oc.phone].filter(Boolean).join(' · ') || '—'}
                          {ownerWhen && (
                            <>
                              <br />
                              <span className="row-sub">{ownerWhen}</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-cell">
                      {m.status === 'pending' && (
                        <button type="button" onClick={() => handleNotify(m._id)} className="notify-btn">Notify</button>
                      )}
                      <button type="button" onClick={() => deleteMatch(m._id)} className="del-btn">Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </div>

      {selectedItem && (
        <div className="item-modal-overlay" onClick={closeItemDetails} role="presentation">
          <div className="item-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="item-modal-title">
            <div className="item-modal-header">
              <div className="item-modal-header-main">
                <h3 id="item-modal-title">Item details</h3>
                <span className={`item-modal-type-pill item-modal-type-pill--${selectedItemType === 'Lost Item' ? 'lost' : 'found'}`}>
                  {selectedItemType}
                </span>
              </div>
              <button type="button" className="item-modal-close" onClick={closeItemDetails} aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="item-modal-body">
              {[
                { label: 'Item Name', value: selectedItem.itemName },
                { label: 'Category', value: selectedItem.category },
                { label: 'Color', value: selectedItem.color },
                { label: 'Location', value: selectedItem.location },
                {
                  label: 'Date & Time',
                  value: selectedItem.dateTime ? new Date(selectedItem.dateTime).toLocaleString() : null,
                },
                { label: 'Description', value: selectedItem.description },
                ...('userEmail' in selectedItem ? [{ label: 'User Email', value: selectedItem.userEmail }] : []),
              ].map(({ label, value }) => (
                <div className="item-modal-row" key={label}>
                  <span className="item-modal-row-label">{label}</span>
                  <span className="item-modal-row-value">{value || 'N/A'}</span>
                </div>
              ))}

              {selectedItem.image && (
                <div className="item-modal-image-wrap">
                  <img
                    src={resolveImageSrc(selectedItem.image)}
                    alt={selectedItem.itemName || 'item'}
                    className="item-modal-image"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminMatchPanel;