const Match = require('../../models/smart_matching/Match');
const LostItem = require('../../models/Lost-Found_MS/LostItem');
const FoundItem = require('../../models/Lost-Found_MS/FoundItem');
const nodemailer = require('nodemailer');
const { compareLostFoundImages, normalizeStoredImage } = require('../../services/hfClip');

// ── Smart matching scoring (weighted percent) ──
// inputPoints: 0..100 (Item Name, Category, Color, Location, Date & Time, Description)
// imageSimilarity: 0..1 -> imageScore%: 0..100
// overallScore% = inputScore*0.6 + imageScore*0.4
const INPUT_SCORE_MAX = 100;
const IMAGE_SCORE_MAX = 100;
const INPUT_WEIGHT = 0.6;
const IMAGE_WEIGHT = 0.4;
const INPUT_SCORE_MIN_TO_SAVE = 60; // keep only matches with >=60% local/input score

// Input-score weights (sum = 100)
const TITLE_SCORE_EXACT = 25;
const TITLE_SCORE_PARTIAL = 15;
const DESCRIPTION_SCORE_MAX = 20;
const CATEGORY_SCORE = 15;
const COLOR_SCORE = 10;
const LOCATION_SCORE = 15;
const DATE_SCORE = 15;
const MIN_TEXT_LEN = 2;

// Basic text validation for required form fields.
function isValidBasicText(value, minLen = MIN_TEXT_LEN) {
    if (typeof value !== 'string') return false;
    const t = value.trim();
    if (t.length < minLen) return false;
    // Must include at least one letter/number.
    return /[a-z0-9]/i.test(t);
}

// Validate minimal lost/found form fields before running matching rules.
function validateItemForMatching(item) {
    if (!item || typeof item !== 'object') return false;
    if (!isValidBasicText(item.itemName, 2)) return false;
    if (!isValidBasicText(item.category, 2)) return false;
    if (!isValidBasicText(item.color, 2)) return false;
    if (!isValidBasicText(item.location, 2)) return false;
    if (!isValidBasicText(item.description, 2)) return false;
    const dt = new Date(item.dateTime);
    if (Number.isNaN(dt.getTime())) return false;
    return true;
}

// Title (itemName) score: exact or partial (substring) match.
function scoreTitle(lostTitle, foundTitle) {
    const a = String(lostTitle || '').toLowerCase().trim();
    const b = String(foundTitle || '').toLowerCase().trim();
    if (!a || !b) return 0;
    if (a === b) return TITLE_SCORE_EXACT;
    // Partial is allowed only for meaningful names to avoid accidental tiny-string matches.
    if (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a))) return TITLE_SCORE_PARTIAL;
    // Token overlap check (e.g., "black wallet" vs "wallet black").
    const aTokens = a.split(/\s+/).filter((t) => t.length >= 3);
    const bTokens = b.split(/\s+/).filter((t) => t.length >= 3);
    if (!aTokens.length || !bTokens.length) return 0;
    const bSet = new Set(bTokens);
    const hasOverlap = aTokens.some((t) => bSet.has(t));
    if (hasOverlap) return TITLE_SCORE_PARTIAL;
    return 0;
}

// Date order rule: lost date/time must be earlier than or equal to found date/time.
function isValidLostFoundDateOrder(lostDateTime, foundDateTime) {
    const lostDate = new Date(lostDateTime);
    const foundDate = new Date(foundDateTime);
    if (Number.isNaN(lostDate.getTime()) || Number.isNaN(foundDate.getTime())) return false;
    return lostDate <= foundDate;
}

// Category match (simple exact after trim/lower).
function isSameCategory(lostCategory, foundCategory) {
    return String(lostCategory || '').toLowerCase().trim() === String(foundCategory || '').toLowerCase().trim();
}

// Pair-level gate used before saving/showing: date order + name match.
function pairPassesRequiredValidation(lost, found) {
    if (!isValidLostFoundDateOrder(lost?.dateTime, found?.dateTime)) return false;
    const nameScore = scoreTitle(lost?.itemName, found?.itemName);
    if (nameScore < TITLE_SCORE_PARTIAL) return false; // names must match (exact or partial)
    return true;
}

// Compute inputScore (0..100) from form fields only.
function computeInputScore(lost, found) {
    let inputScore = 0;

    inputScore += scoreTitle(lost.itemName, found.itemName);           // 0..25
    if (isSameCategory(lost.category, found.category)) inputScore += CATEGORY_SCORE; // 0..15
    if (String(lost.color || '').toLowerCase().trim() === String(found.color || '').toLowerCase().trim()) {
        inputScore += COLOR_SCORE; // 0..10
    }

    if (String(lost.location || '').toLowerCase().trim() === String(found.location || '').toLowerCase().trim()) {
        inputScore += LOCATION_SCORE; // 0..15
    }

    const lostDate = new Date(lost.dateTime);
    const foundDate = new Date(found.dateTime);
    if (!Number.isNaN(lostDate.getTime()) && !Number.isNaN(foundDate.getTime()) && foundDate >= lostDate) {
        inputScore += DATE_SCORE; // 0..15
    }

    const lostDesc = (lost.description || '').toLowerCase();
    const foundDesc = (found.description || '').toLowerCase();
    if (lostDesc && foundDesc && lostDesc === foundDesc) {
        inputScore += DESCRIPTION_SCORE_MAX;
    } else {
        const keywords = ['nike', 'apple', 'samsung', 'branded', 'broken', 'cracked', 'leather', 'wallet', 'keys'];
        let keywordMatches = 0;
        keywords.forEach((word) => {
            if (lostDesc.includes(word) && foundDesc.includes(word)) keywordMatches++;
        });
        // 0..20 (4 points per common keyword, max 20)
        inputScore += Math.min(keywordMatches * 4, DESCRIPTION_SCORE_MAX);
    }

    inputScore = Math.max(0, Math.min(INPUT_SCORE_MAX, inputScore));
    return inputScore;
}

function toInputPercent(inputPoints) {
    const points = Math.max(0, Math.min(INPUT_SCORE_MAX, Number(inputPoints) || 0));
    return Math.round((points / INPUT_SCORE_MAX) * 100);
}

function toWeightedOverallPercent(inputPercent, imagePercent) {
    const inPct = Math.max(0, Math.min(100, Number(inputPercent) || 0));
    const imgPct = Math.max(0, Math.min(100, Number(imagePercent) || 0));
    return Math.round((inPct * INPUT_WEIGHT) + (imgPct * IMAGE_WEIGHT));
}

// Shared mail transporter used for user notifications.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// (imageScore max is 40 per spec; defined above)

const lostPopulateSelect =
    'itemName category color dateTime location description image userEmail';
const foundPopulateSelect =
    'itemName category color dateTime location description image';

/**
 * Step 1 — Form data only. Saves only if: same category, credible item-name link,
 * and rule score ≥ 60% (name scoring is strict — not substring-only).
 */
exports.findMatches = async (req, res) => {
    try {
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();

        let newMatchesCount = 0;
        let updatedMatchesCount = 0;
        let skippedInvalidInput = 0;

        for (const lost of lostItems) {
            if (!validateItemForMatching(lost)) {
                skippedInvalidInput++;
                continue;
            }
            for (const found of foundItems) {
                if (!validateItemForMatching(found)) {
                    skippedInvalidInput++;
                    continue;
                }
                // Required pair validation:
                // 1) lost date/time <= found date/time
                // 2) item names must match (exact or partial)
                if (!pairPassesRequiredValidation(lost, found)) {
                    continue;
                }

                const inputPoints = computeInputScore(lost, found);
                const inputScore = toInputPercent(inputPoints); // stored as 0..100% (input points max is 100)
                if (inputScore < INPUT_SCORE_MIN_TO_SAVE) continue;

                const existingMatch = await Match.findOne({
                    lostItemId: lost._id,
                    foundItemId: found._id
                });

                if (!existingMatch) {
                    await new Match({
                        lostItemId: lost._id,
                        foundItemId: found._id,
                        inputScore,
                        imageScore: 0,
                        overallScore: toWeightedOverallPercent(inputScore, 0),
                        matchScore: toWeightedOverallPercent(inputScore, 0),
                        ruleScore: inputScore,
                        status: 'pending',
                        imageSimilarity: null,
                        imageAiStatus: 'pending_ai'
                    }).save();
                    newMatchesCount++;
                } else {
                    // Step-1 run should keep match as "form-only" until admin manually runs AI step.
                    existingMatch.inputScore = inputScore;
                    existingMatch.ruleScore = inputScore;
                    existingMatch.imageScore = 0;
                    existingMatch.imageSimilarity = null;
                    existingMatch.imageAiStatus = 'pending_ai';
                    existingMatch.overallScore = toWeightedOverallPercent(inputScore, 0);
                    existingMatch.matchScore = toWeightedOverallPercent(inputScore, 0);
                    await existingMatch.save();
                    updatedMatchesCount++;
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Input scoring saved as %. Matches saved when inputScore >= ${INPUT_SCORE_MIN_TO_SAVE}%. Overall = input*60% + image*40%.`,
            matchesFound: newMatchesCount,
            matchesUpdated: updatedMatchesCount,
            skippedInvalidInput
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Step 2 — Admin runs CLIP on all saved matches; image bonus 0–20; overall = min(100, form + image).
 */
exports.runImageAiForMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('lostItemId', lostPopulateSelect)
            .populate('foundItemId', foundPopulateSelect);

        let processed = 0;
        let aiScoredCount = 0;
        let skipped = 0;

        for (const match of matches) {
            const lost = match.lostItemId;
            const found = match.foundItemId;
            if (!lost || !found) {
                skipped++;
                continue;
            }

            // Prevent duplicate scoring: if already scored once, skip re-calculation.
            if (match.imageAiStatus === 'scored') {
                continue;
            }

            const inputScore =
                typeof match.inputScore === 'number'
                    ? match.inputScore
                    : typeof match.ruleScore === 'number'
                      ? match.ruleScore
                      : 0;

            let imageSimilarity = null;
            let imageScore = 0;
            let imageAiStatus = 'pending_ai';

            if (!normalizeStoredImage(lost.image) || !normalizeStoredImage(found.image)) {
                imageAiStatus = 'missing_image';
            } else {
                try {
                    const { imageSimilarity: sim } = await compareLostFoundImages(
                        lost.image,
                        found.image
                    );
                    imageSimilarity = Math.max(0, Math.min(1, sim));
                    imageScore = Math.round(imageSimilarity * IMAGE_SCORE_MAX); // 0..100%
                    imageAiStatus = 'scored';
                    aiScoredCount++;
                } catch (e) {
                    imageSimilarity = null;
                    imageScore = 0;
                    const code = e?.code;
                    const msg = String(e?.message || e);
                    if (code === 'ENOENT' || /ENOENT|no such file|not found/i.test(msg)) {
                        imageAiStatus = 'file_not_found';
                    } else if (/fetch failed|Image URL fetch|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
                        imageAiStatus = 'image_url_error';
                    } else {
                        imageAiStatus = 'hf_error';
                    }
                }
            }

            match.inputScore = inputScore;
            match.ruleScore = inputScore; // legacy mirror
            match.imageSimilarity = imageSimilarity;
            match.imageScore = imageScore;
            match.imageAiStatus = imageAiStatus;
            match.overallScore = toWeightedOverallPercent(inputScore, imageScore);
            match.matchScore = match.overallScore;
            await match.save();
            processed++;
        }

        res.status(200).json({
            success: true,
            message: 'AI image scoring finished. overallScore = inputScore*0.6 + imageScore*0.4.',
            processed,
            aiScoredOk: aiScoredCount,
            skippedMissingRefs: skipped
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Return all saved matches with lost/found item details populated.
exports.getMatches = async (req, res) => {
    try {
        const allMatches = await Match.find()
            .populate('lostItemId', lostPopulateSelect)
            .populate('foundItemId', foundPopulateSelect);

        // Hide invalid old records from Admin panel:
        // - invalid refs
        // - date order violation (lost > found)
        // - non-matching names
        const matches = allMatches.filter((m) => {
            if (!m?.lostItemId || !m?.foundItemId) return false;
            if (!pairPassesRequiredValidation(m.lostItemId, m.foundItemId)) return false;

            // Show in Admin panel only when local/input score is within 60..100%.
            const inputScore =
                typeof m?.inputScore === 'number'
                    ? m.inputScore
                    : typeof m?.ruleScore === 'number'
                      ? m.ruleScore
                      : 0;
            if (inputScore < INPUT_SCORE_MIN_TO_SAVE || inputScore > 100) return false;

            return true;
        });

        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a match status (pending/notified/resolved).
exports.updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

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

// Delete one match by its ID.
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

// Delete all matches in bulk.
exports.deleteAllMatches = async (req, res) => {
    try {
        await Match.deleteMany({});
        res.status(200).json({ success: true, message: "All matches cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Build and send a match-notification email to one user.
exports.sendMatchNotification = async (userEmail, lostItemName, matchScore) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Good News! A potential match for your lost item was found',
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #28a745;">Potential Match Found!</h2>
                <p>Hello,</p>
                <p>Our smart matching system found a match for your lost item: <strong>${lostItemName}</strong>.</p>
                <p><strong>Match Confidence:</strong> ${matchScore}%</p>
                <p>Please log in to your dashboard to view the details and claim your item.</p>
                <br>
                <p>Best regards,<br>Lost & Found Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Trigger notification flow for one match and mark it as notified.
exports.notifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await Match.findById(id).populate('lostItemId');

        if (!match) return res.status(404).json({ message: "Match not found" });

        const userEmail = match.lostItemId.userEmail;

        await exports.sendMatchNotification(userEmail, match.lostItemId.itemName, match.matchScore);

        match.status = 'notified';
        await match.save();

        res.status(200).json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
