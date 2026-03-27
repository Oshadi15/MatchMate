import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './UserMatches.css';

const UserMatches = ({ lostItemId }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyMatches = useCallback(async () => {
        const lostId = lostItemId?._id ?? lostItemId;
        if (!lostId) {
            setMatches([]);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/api/smart-match/all-matches');
            // Filter matches that belong to this specific user's lost item
            const myMatches = res.data.filter(m => m.lostItemId?._id === lostId);
            setMatches(myMatches);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching matches", err);
            setLoading(false);
        }
    }, [lostItemId]);

    useEffect(() => {
        fetchMyMatches();
    }, [fetchMyMatches]);

    if (loading) return <div className="loader">Searching for matches...</div>;

    const lostItemName =
        lostItemId?.itemName ??
        matches[0]?.lostItemId?.itemName ??
        'your item';

    return (
        <div className="user-matches-container">
            <h3>Potential Matches for your "{lostItemName}"</h3>
            <div className="match-grid">
                {matches.length > 0 ? (
                    matches.map(match => (
                        <div key={match._id} className="match-card">
                            <div className="score-badge">{match.matchScore}% Match</div>
                            <img src={`http://localhost:5000/${match.foundItemId.image}`} alt="Found Item" />
                            <div className="match-details">
                                <h4>{match.foundItemId.itemName}</h4>
                                <p><strong>Found at:</strong> {match.foundItemId.location}</p>
                                <p><strong>Color:</strong> {match.foundItemId.color}</p>
                                <button className="claim-btn">That's Mine!</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No matches found yet. We'll notify you when someone finds your item.</p>
                )}
            </div>
        </div>
    );
};

export default UserMatches;