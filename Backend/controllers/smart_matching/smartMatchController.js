const Match = require('../../models/smart_matching/Match');
const LostItem = require('../../models/Lost-Found_MS/LostItem');
const FoundItem = require('../../models/Lost-Found_MS/FoundItem');

// 1. Smart Matching Logic (100-point)
exports.findMatches = async (req, res) => {
    try {
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();
        
        let newMatchesCount = 0;

        for (const lost of lostItems) {
            for (const found of foundItems) {
                
                let score = 0;

                // 1. Item Name (Max Score: 30)
                if (lost.itemName.toLowerCase() === found.itemName.toLowerCase()) {
                    score += 30;
                } else if (lost.itemName.toLowerCase().includes(found.itemName.toLowerCase()) || 
                           found.itemName.toLowerCase().includes(lost.itemName.toLowerCase())) {
                    score += 15; // if name little bit matches, give partial score
                }
                
                // 2. Category (Max Score: 20)
                if (lost.category.toLowerCase() === found.category.toLowerCase()) {
                    score += 20;
                }

                // 3. Color (Max Score: 20)
                if (lost.color.toLowerCase() === found.color.toLowerCase()) {
                    score += 20;
                }

                // 4. Location (Max Score: 15)
                if (lost.location.toLowerCase() === found.location.toLowerCase()) {
                    score += 15;
                }

                // 5. Date Time (Max Score: 5)
               
                if (new Date(found.dateTime) >= new Date(lost.dateTime)) {
                    score += 5;
                }

                // 6. Description (Max Score: 10)
                const lostDesc = (lost.description || "").toLowerCase();
                const foundDesc = (found.description || "").toLowerCase();
                
                if (lostDesc === foundDesc && lostDesc !== "") {
                    score += 10;
                } else {
                    const keywords = ["nike", "apple", "samsung", "branded", "broken", "cracked", "leather", "wallet", "keys"];
                    let keywordMatches = 0;
                    keywords.forEach(word => {
                        if (lostDesc.includes(word) && foundDesc.includes(word)) {
                            keywordMatches++;
                        }
                    });
                    // vachana legapena thramata score 10 full
                    score += Math.min(keywordMatches * 5, 10);
                }

                // 🔥 if Score above upto 60 then save
                if (score >= 60) {
                    const existingMatch = await Match.findOne({
                        lostItemId: lost._id,
                        foundItemId: found._id
                    });

                    if (!existingMatch) {
                        const newMatch = new Match({
                            lostItemId: lost._id,
                            foundItemId: found._id,
                            matchScore: score, 
                            status: 'pending'
                        });

                        await newMatch.save();
                        newMatchesCount++;
                    }
                }
            }
        }

        res.status(200).json({ 
            success: true,
            message: "Smart matching completed with 100-point scale!", 
            matchesFound: newMatchesCount 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. All Matches 
exports.getMatches = async (req, res) => {
    try {
        // Populate --> LostItem and FoundItem full details
        const matches = await Match.find()
            .populate('lostItemId')
            .populate('foundItemId');
            
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3.  update the matches status (pending, notified, resolved)
exports.updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'pending', 'notified', 'resolved'

        const updatedMatch = await Match.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Delete one match by ID (if admin wants to remove a specific match)
exports.deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMatch = await Match.findByIdAndDelete(id);

        if (!deletedMatch) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        res.status(200).json({ success: true, message: "Match deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5. delete All matches (if admin wants to clear all matches, e.g., after a certain period or for maintenance)
exports.deleteAllMatches = async (req, res) => {
    try {
        await Match.deleteMany({});
        res.status(200).json({ success: true, message: "All matches cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};