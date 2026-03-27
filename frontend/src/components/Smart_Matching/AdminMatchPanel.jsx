import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminMatchPanel.css';

const AdminMatchPanel = () => {
    const [matches, setMatches] = useState([]);
    const [stats, setStats] = useState({ loading: false, msg: '' });

    const runMatching = async () => {
        setStats({ loading: true, msg: 'Running Algorithm...' });
        const res = await axios.post('http://localhost:5000/api/smart-match/run-match');
        setStats({ loading: false, msg: `Found ${res.data.matchesFound} new matches!` });
        fetchMatches();
    };

    const fetchMatches = async () => {
        const res = await axios.get('http://localhost:5000/api/smart-match/all-matches');
        setMatches(res.data);
    };

    const deleteMatch = async (id) => {
        await axios.delete(`http://localhost:5000/api/smart-match/${id}`);
        fetchMatches();
    };

    const handleNotify = async (id) => {
    try {
        await axios.post(`http://localhost:5000/api/smart-match/notify/${id}`);
        alert("Notification sent to user!");
        fetchMatches(); // Refresh the table to show 'notified' status
    } catch (err) {
        alert("Failed to send notification");
    }
};

    useEffect(() => { fetchMatches(); }, []);

    return (
        <div className="admin-panel">
            <h2>Smart Matching Control Center</h2>
            <div className="admin-actions">
                <button onClick={runMatching} disabled={stats.loading} className="run-btn">
                    {stats.loading ? 'Processing...' : 'Run Smart Matcher'}
                </button>
                <p className="status-msg">{stats.msg}</p>
            </div>

            <table className="match-table">
                <thead>
                    <tr>
                        <th>Lost Item</th>
                        <th>Found Item</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map(m => (
                        <tr key={m._id}>
                            <td>{m.lostItemId?.itemName}</td>
                            <td>{m.foundItemId?.itemName}</td>
                            <td><span className="table-score">{m.matchScore}%</span></td>
                            <td><span className={`status ${m.status}`}>{m.status}</span></td>
                            <td>
                               {m.status === 'pending' && (
                                   <button onClick={() => handleNotify(m._id)} className="notify-btn">
                                       Send Alert
                                   </button>
                               )}
                               <button onClick={() => deleteMatch(m._id)} className="del-btn">Remove</button>
                            </td>
                            
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminMatchPanel;