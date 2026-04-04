import React, { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../../services/api';
import './AdminMatchPanel.css';
import { useNavigate } from 'react-router-dom';

function clamp01(n) {
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
}

function getAiStatusPill(status) {
  switch (status) {
    case 'scored':
      return { label: 'Scored', cls: 'ai-pill ai-pill--ok' };
    case 'pending_ai':
      return { label: 'Pending', cls: 'ai-pill ai-pill--pending' };
    case 'missing_image':
      return { label: 'No photo', cls: 'ai-pill ai-pill--skip' };
    case 'file_not_found':
    case 'image_url_error':
      return { label: 'Image issue', cls: 'ai-pill ai-pill--skip' };
    case 'hf_error':
      return { label: 'AI error', cls: 'ai-pill ai-pill--err' };
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

  const handleNotify = async (id) => {
    const matchId = String(id);
    const row = matches.find((m) => String(m._id) === matchId);
    const existingEmail = (row?.lostItemId?.userEmail || '').trim();
    let email = existingEmail;
    if (!email) {
      const entered = window.prompt(
        'This lost report has no email on file. Enter the owner account email so they can see this in Smart Matches:',
        ''
      );
      if (entered == null) return;
      email = String(entered).trim();
      if (!email) {
        alert('A valid email is required so the owner can see matches in Smart Matches.');
        return;
      }
    }
    try {
      const payload = existingEmail ? {} : { email };
      await API.post(`/api/smart-match/notify/${matchId}`, payload);
      alert('User will see this on their Smart Matches page.');
      fetchMatches();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to send notification';
      alert(msg);
    }
  };

  const openItemDetails = (item, type) => {
    if (!item) return;
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
    setSelectedItemType('');
  };

  const resolveImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${apiBaseUrl}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${apiBaseUrl}/${imagePath}`;
    return `${apiBaseUrl}/uploads/${imagePath}`;
  };

  const filteredMatches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    let out = matches.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (aiFilter !== 'all') {
        if (aiFilter === 'scored' && m.imageAiStatus !== 'scored') return false;
        if (aiFilter === 'pending' && m.imageAiStatus !== 'pending_ai') return false;
        if (
          aiFilter === 'issue' &&
          !['hf_error', 'file_not_found', 'image_url_error', 'missing_image'].includes(m.imageAiStatus)
        ) {
          return false;
        }
      }
      if (ownerFilter !== 'all') {
        const r = m.lostOwnerResponse || 'none';
        if (ownerFilter !== r) return false;
      }
      if (!q) return true;
      const lostName = (m?.lostItemId?.itemName || '').toLowerCase();
      const foundName = (m?.foundItemId?.itemName || '').toLowerCase();
      const lostCat = (m?.lostItemId?.category || '').toLowerCase();
      const foundCat = (m?.foundItemId?.category || '').toLowerCase();
      return [lostName, foundName, lostCat, foundCat].some((v) => v.includes(q));
    });

    out = [...out].sort((a, b) => {
      const aOverall = Number(a.overallScore ?? a.matchScore ?? 0);
      const bOverall = Number(b.overallScore ?? b.matchScore ?? 0);
      const aInput = Number(a.inputScore ?? a.ruleScore ?? 0);
      const bInput = Number(b.inputScore ?? b.ruleScore ?? 0);
      const aImg = Number(a.imageScore ?? 0);
      const bImg = Number(b.imageScore ?? 0);
      const aT = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bT = new Date(b.updatedAt || b.createdAt || 0).getTime();

      switch (sortBy) {
        case 'overall_asc': return aOverall - bOverall;
        case 'overall_desc': return bOverall - aOverall;
        case 'input_desc': return bInput - aInput;
        case 'image_desc': return bImg - aImg;
        case 'latest': return bT - aT;
        default: return bOverall - aOverall;
      }
    });

    return out;
  }, [matches, searchText, statusFilter, aiFilter, sortBy, ownerFilter]);

  useEffect(() => {
    // Only admin should be allowed to view all matches.
    if (!isAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchMatches();
  }, [fetchMatches, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
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