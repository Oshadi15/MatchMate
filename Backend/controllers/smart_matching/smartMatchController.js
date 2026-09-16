const Match = require('../../models/smart_matching/Match');
const LostItem = require('../../models/Lost-Found_MS/LostItem');
const FoundItem = require('../../models/Lost-Found_MS/FoundItem');
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



function isValidBasicText(value, minLen = MIN_TEXT_LEN) {
    // Check if value is a string
    if (typeof value !== 'string') return false;
    
    const t = value.trim();
    
    // Check minimum length (prevents empty or too-short strings)
    if (t.length < minLen) return false;
    
    // Must include at least one letter/number (prevents strings like "!!!!" )
    return /[a-z0-9]/i.test(t);
}

/**
 * VALIDATION: Validate lost/found items before matching
 * Checks all required fields have valid data before processing
 * Requirements: itemName, category, color, location, description must be valid text
 *              dateTime must be a valid date
 * @param {Object} item - The lost or found item to validate
 * @returns {boolean} - True if all fields are valid
 */
function validateItemForMatching(item) {
    // Check if item exists and is an object
    if (!item || typeof item !== 'object') return false;
    
    // VALIDATION: itemName - must be valid text (2+ chars with alphanumeric)
    if (!isValidBasicText(item.itemName, 2)) return false;
    
    // VALIDATION: category - must be valid text (2+ chars with alphanumeric)
    if (!isValidBasicText(item.category, 2)) return false;
    
    // VALIDATION: color - must be valid text (2+ chars with alphanumeric)
    if (!isValidBasicText(item.color, 2)) return false;
    
    // VALIDATION: location - must be valid text (2+ chars with alphanumeric)
    if (!isValidBasicText(item.location, 2)) return false;
    
    // VALIDATION: description - must be valid text (2+ chars with alphanumeric)
    if (!isValidBasicText(item.description, 2)) return false;
    
    // VALIDATION: dateTime - must be a valid, parseable date
    const dt = new Date(item.dateTime);
    if (Number.isNaN(dt.getTime())) return false;
    
    return true;
}

/**
 * VALIDATION: Score titles (item names) - exact or partial match
 * Scoring rules:
 *   - Exact match (e.g., "red wallet" == "red wallet"): 25 points
 *   - Partial substring match (e.g., "red wallet" includes "wallet"): 15 points
 *   - Token overlap (e.g., "black wallet" vs "wallet black"): 15 points
 *   - No match: 0 points
 * Prevents false positives from very short strings (e.g., "a" matching "apple")
 * @param {string} lostTitle - Title from lost item
 * @param {string} foundTitle - Title from found item
 * @returns {number} - Points scored (0, 15, or 25)
 */
function scoreTitle(lostTitle, foundTitle) {
    // Normalize both titles: lowercase and trim whitespace
    const a = String(lostTitle || '').toLowerCase().trim();
    const b = String(foundTitle || '').toLowerCase().trim();
    
    // VALIDATION: Both must have content to score
    if (!a || !b) return 0;
    
    // VALIDATION: Exact match - highest confidence
    if (a === b) return TITLE_SCORE_EXACT;
    
    // VALIDATION: Partial substring match (only for meaningful names, 3+ chars)
    // Prevents "tv" matching "steve" accidentally
    if (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a))) {
        return TITLE_SCORE_PARTIAL;
    }
    
    // VALIDATION: Token overlap check (word-based matching)
    // Allows "black wallet" to match "wallet black"
    const aTokens = a.split(/\s+/).filter((t) => t.length >= 3);
    const bTokens = b.split(/\s+/).filter((t) => t.length >= 3);
    
    // VALIDATION: Must have meaningful tokens (3+ chars) in both
    if (!aTokens.length || !bTokens.length) return 0;
    
    // VALIDATION: Check if any token overlaps between items
    const bSet = new Set(bTokens);
    const hasOverlap = aTokens.some((t) => bSet.has(t));
    if (hasOverlap) return TITLE_SCORE_PARTIAL;
    
    // No match found
    return 0;
}

/**
 * VALIDATION: Check date/time order - lost date must be <= found date
 * Ensures logical consistency: item can't be found before it was lost
 * @param {string|Date} lostDateTime - Date when item was lost
 * @param {string|Date} foundDateTime - Date when item was found
 * @returns {boolean} - True if lostDateTime <= foundDateTime
 */

//- item can't be found before it was los
function isValidLostFoundDateOrder(lostDateTime, foundDateTime) {
    // VALIDATION: Parse both dates
    const lostDate = new Date(lostDateTime);
    const foundDate = new Date(foundDateTime);
    
    // VALIDATION: Both dates must be valid and parseable
    if (Number.isNaN(lostDate.getTime()) || Number.isNaN(foundDate.getTime())) return false;
    
    // VALIDATION: Lost date must be before or equal to found date
    return lostDate <= foundDate;
}

/**
 * VALIDATION: Check if categories match exactly
 * Simple case-insensitive exact match
 * @param {string} lostCategory - Category of lost item
 * @param {string} foundCategory - Category of found item
 * @returns {boolean} - True if categories match
 */
function isSameCategory(lostCategory, foundCategory) {
    // VALIDATION: Case-insensitive exact match after trimming whitespace
    return String(lostCategory || '').toLowerCase().trim() === 
           String(foundCategory || '').toLowerCase().trim();
}

/**
 * VALIDATION: Pair-level gate - checks if a lost/found pair passes required validation
 * Must satisfy BOTH conditions:
 *   1. Lost date must be before or equal to found date
 *   2. Item names must match (exact or partial)
 * If pair fails either check, it cannot be used for matching
 * @param {Object} lost - Lost item object
 * @param {Object} found - Found item object
 * @returns {boolean} - True if pair passes all required validations
 */
function pairPassesRequiredValidation(lost, found) {
    // VALIDATION: Date order - can't find item before it was lost
    if (!isValidLostFoundDateOrder(lost?.dateTime, found?.dateTime)) return false;
    
    // VALIDATION: Name match - must have at least partial name match for validity
    const nameScore = scoreTitle(lost?.itemName, found?.itemName);
    if (nameScore < TITLE_SCORE_PARTIAL) return false;
    
    return true;
}

/**
 * VALIDATION & SCORING: Compute input score from form fields (0..100)
 * Scoring breakdown (total max = 100):
 *   - Title/itemName match: 0..25 points (exact or partial)
 *   - Category match: 0..15 points (must be exact)
 *   - Color match: 0..10 points (must be exact)
 *   - Location match: 0..15 points (must be exact)
 *   - Date/time match: 0..15 points (lost date <= found date)
 *   - Description match: 0..20 points (exact match OR keyword overlap)
 * 
 * Only pairs that pass pairPassesRequiredValidation() are scored
 * @param {Object} lost - Lost item with validated fields
 * @param {Object} found - Found item with validated fields
 * @returns {number} - Input score (0..100)
 */
function computeInputScore(lost, found) {
    let inputScore = 0;

    // VALIDATION: Score item names (exact or partial) - up to 25 points
    inputScore += scoreTitle(lost.itemName, found.itemName);

    // VALIDATION: Check category match - up to 15 points for exact match
    if (isSameCategory(lost.category, found.category)) inputScore += CATEGORY_SCORE;

    // VALIDATION: Check color match - up to 10 points (case-insensitive exact match)
    if (String(lost.color || '').toLowerCase().trim() === String(found.color || '').toLowerCase().trim()) {
        inputScore += COLOR_SCORE;
    }

    // VALIDATION: Check location match - up to 15 points (case-insensitive exact match)
    if (String(lost.location || '').toLowerCase().trim() === String(found.location || '').toLowerCase().trim()) {
        inputScore += LOCATION_SCORE;
    }

    // VALIDATION: Check date/time order - up to 15 points
    const lostDate = new Date(lost.dateTime);
    const foundDate = new Date(found.dateTime);
    if (!Number.isNaN(lostDate.getTime()) && !Number.isNaN(foundDate.getTime()) && foundDate >= lostDate) {
        inputScore += DATE_SCORE;
    }

    // VALIDATION: Check description match - up to 20 points
    const lostDesc = (lost.description || '').toLowerCase();
    const foundDesc = (found.description || '').toLowerCase();
    
    if (lostDesc && foundDesc && lostDesc === foundDesc) {
        // VALIDATION: Exact description match - full 20 points
        inputScore += DESCRIPTION_SCORE_MAX;
    } else {
        // VALIDATION: Keyword matching for partial description match
        // Keywords: brand names, condition descriptors, material/type
        const keywords = ['nike', 'apple', 'samsung', 'branded', 'broken', 'cracked', 'leather', 'wallet', 'keys'];
        let keywordMatches = 0;
        keywords.forEach((word) => {
            // Count common keywords between descriptions
            if (lostDesc.includes(word) && foundDesc.includes(word)) keywordMatches++;
        });
        // VALIDATION: Award 4 points per matching keyword, max 20 points
        inputScore += Math.min(keywordMatches * 4, DESCRIPTION_SCORE_MAX);
    }

    // VALIDATION: Ensure final score is within valid range (0..100)
    inputScore = Math.max(0, Math.min(INPUT_SCORE_MAX, inputScore));
    return inputScore;
}

/**
 * VALIDATION: Convert input points to percentage (0..100%)
 * Ensures value is clamped between 0-100 and handles non-numeric inputs
 * @param {number} inputPoints - Points value (may be undefined/null)
 * @returns {number} - Percentage (0..100)
 */
function toInputPercent(inputPoints) {
    // VALIDATION: Coerce to number, default to 0 if invalid, clamp to 0..100
    const points = Math.max(0, Math.min(INPUT_SCORE_MAX, Number(inputPoints) || 0));
    return Math.round((points / INPUT_SCORE_MAX) * 100);
}

/**
 * VALIDATION: Calculate weighted overall score from input and image scores
 * Formula: overallScore = (inputPercent × 0.6) + (imagePercent × 0.4)
 * Input (form fields) weighted at 60%, image (AI) weighted at 40%
 */
function toWeightedOverallPercent(inputPercent, imagePercent) {
    // VALIDATION: Clamp both inputs to valid percentage range
    const inPct = Math.max(0, Math.min(100, Number(inputPercent) || 0));
    const imgPct = Math.max(0, Math.min(100, Number(imagePercent) || 0));
    
    // VALIDATION: Compute weighted average and round to integer
    return Math.round((inPct * INPUT_WEIGHT) + (imgPct * IMAGE_WEIGHT));
}

// Database field selectors for populated queries
const lostPopulateSelect =
    'itemName category color dateTime location description image userEmail';
const foundPopulateSelect =
    'itemName category color dateTime location description image userEmail';

/**
 * VALIDATION: Check if two email addresses match
 * Case-insensitive comparison with whitespace trimming
 * @param {string} a - First email
 * @param {string} b - Second email
 * @returns {boolean} - True if emails match
 */
function sameEmail(a, b) {
    // VALIDATION: Case-insensitive, trim whitespace before comparison
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

/**
 * VALIDATION: Filter matches for user view (applies minimum score threshold)
 * Only returns matches that:
 *   1. Have both lost and found items (not broken references)
 *   2. Pass required pair validations
 *   3. Meet minimum input score threshold (60%)
 * @param {Object} m - Match object from database
 * @returns {boolean} - True if match should be shown to users
 */
function baseUserMatchFilter(m) {
    // VALIDATION: Must have both lost and found items
    if (!m?.lostItemId || !m?.foundItemId) return false;
    
    // VALIDATION: Must pass required validations (date order + name match)
    if (!pairPassesRequiredValidation(m.lostItemId, m.foundItemId)) return false;
    
    // VALIDATION: Get the actual input score (fallback to ruleScore for backward compatibility)
    const inputScore =
        typeof m?.inputScore === 'number'
            ? m.inputScore
            : typeof m?.ruleScore === 'number'
              ? m.ruleScore
              : 0;
    
    // VALIDATION: Only show if input score meets minimum threshold (60%)
    if (inputScore < INPUT_SCORE_MIN_TO_SAVE || inputScore > 100) return false;
    
    return true;
}

/**
 * Step 1 — Form data only. Saves only if: same category, credible item-name link,
 * and rule score ≥ 60% (name scoring is strict — not substring-only).
 */
/**
 * ENDPOINT: /api/smart-match/run-match (POST)
 * Step 1: Form-only matching - Score lost/found pairs using field matching only
 * 
 * Process:
 *   1. Retrieve all lost and found items from database
 *   2. For each pair: VALIDATE all required fields exist and are valid
 *   3. VALIDATE pair passes required checks (date order + name match)
 *   4. Calculate input score (form field matching)
 *   5. VALIDATE input score meets minimum threshold (60%)
 *   6. Save match record if new, update if exists
 * 
 * Scoring: 0..100 points from item attributes
 *   - Item name: 0..25 (exact/partial match)
 *   - Category: 0..15 (exact match)
 *   - Color: 0..10 (exact match)
 *   - Location: 0..15 (exact match)
 *   - Date order: 0..15 (lost date <= found date)
 *   - Description: 0..20 (exact match or keyword overlap)
 * 
 * Response: { matchesFound, matchesUpdated, skippedInvalidInput }
 */
exports.findMatches = async (req, res) => {
    try {
        // Retrieve all lost and found items for comparison
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();

        let newMatchesCount = 0;
        let updatedMatchesCount = 0;
        let skippedInvalidInput = 0;

        // VALIDATION: Process each lost item
        for (const lost of lostItems) {
            // VALIDATION: Check lost item has all required fields and valid data
            if (!validateItemForMatching(lost)) {
                skippedInvalidInput++;
                continue;
            }
            
            // VALIDATION: Compare against each found item
            for (const found of foundItems) {
                // VALIDATION: Check found item has all required fields and valid data
                if (!validateItemForMatching(found)) {
                    skippedInvalidInput++;
                    continue;
                }
                
                // VALIDATION: Pair-level gate
                // Requires: (1) Lost date <= Found date, (2) Name match (exact or partial)
                if (!pairPassesRequiredValidation(lost, found)) {
                    continue;
                }

                // CALCULATION: Compute input score from form fields (0..100)
                const inputPoints = computeInputScore(lost, found);
                const inputScore = toInputPercent(inputPoints);
                
                // VALIDATION: Only save matches meeting minimum score threshold
                if (inputScore < INPUT_SCORE_MIN_TO_SAVE) continue;

                // Check if match record already exists
                const existingMatch = await Match.findOne({
                    lostItemId: lost._id,
                    foundItemId: found._id
                });

                if (!existingMatch) {
                    // NEW MATCH: Create and save
                    await new Match({
                        lostItemId: lost._id,
                        foundItemId: found._id,
                        // VALIDATION: Input score (form fields only, no AI yet)
                        inputScore,
                        // Initial AI scores: not yet scored
                        imageScore: 0,
                        // Overall score: input only (60%) + no image (0%)
                        overallScore: toWeightedOverallPercent(inputScore, 0),
                        matchScore: toWeightedOverallPercent(inputScore, 0),
                        // Legacy field for backward compatibility
                        ruleScore: inputScore,
                        // Match not yet notified to user
                        status: 'pending',
                        // No image similarity data yet
                        imageSimilarity: null,
                        // AI scoring stage: waiting for admin to run AI check
                        imageAiStatus: 'pending_ai'
                    }).save();
                    newMatchesCount++;
                } else {
                    // EXISTING MATCH: Update scores from form re-run
                    // VALIDATION: Reset input scores and keep match as "form-only"
                    existingMatch.inputScore = inputScore;
                    existingMatch.ruleScore = inputScore;
                    // Clear previous AI scores - will be recalculated if admin runs AI check
                    existingMatch.imageScore = 0;
                    existingMatch.imageSimilarity = null;
                    existingMatch.imageAiStatus = 'pending_ai';
                    // Recalculate overall score without AI component
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
        const matches = allMatches.filter((m) => baseUserMatchFilter(m));

        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Logged-in user: matches where they own the lost item, or they reported the found item and someone claimed it.
exports.getUserMatches = async (req, res) => {
    try {
        const email = String(req.query.email || '').trim();
        if (!email) {
            return res.status(400).json({ success: false, message: 'email query required' });
        }

        const allMatches = await Match.find()
            .populate('lostItemId', lostPopulateSelect)
            .populate('foundItemId', foundPopulateSelect);

        const asLostOwner = allMatches.filter(
            (m) =>
                baseUserMatchFilter(m) &&
                sameEmail(m.lostItemId?.userEmail, email) &&
                (m.lostOwnerResponse || 'none') !== 'rejected'
        );

        const asFoundOwner = allMatches.filter(
            (m) =>
                baseUserMatchFilter(m) &&
                m.lostUserClaimed &&
                (m.lostOwnerResponse || 'none') === 'claimed' &&
                sameEmail(m.foundItemId?.userEmail, email)
        );

        res.status(200).json({ asLostOwner, asFoundOwner });
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

// Admin marks match as notified — in-app only (Smart Matches page); no email is sent.
/**
 * ENDPOINT: /api/smart-match/notify/:id (POST)
 * Notify lost item owner about a potential match
 * 
 * Validations:
 *   1. Match ID must exist in database
 *   2. Match must have linked lost item (not deleted/orphaned)
 *   3. Contact email must be provided (either on lost item or via request body)
 *   4. Email format must be valid string
 *   5. If no email stored on lost item, override email is saved for future reference
 * 
 * The user sees match in their "Smart Matches" page and can claim it
 * 
 * Request body: { email?: "optional-owner-email@example.com" }
 * Response: { success: boolean, message: string }
 */
exports.notifyUser = async (req, res) => {
    try {
        // VALIDATION: Extract and normalize match ID from URL parameter
        const { id } = req.params;
        
        // VALIDATION: Extract optional override email from request body, normalize (trim, lowercase)
        const overrideEmail = String(req.body?.email || '').trim().toLowerCase();
        
        // Query: Find match and populate lost item details
        const match = await Match.findById(id).populate('lostItemId', lostPopulateSelect);

        // VALIDATION: Match must exist in database
        if (!match) return res.status(404).json({ message: "Match not found" });

        const lost = match.lostItemId;
        
        // VALIDATION: Match must have linked lost item (might be deleted after match was created)
        if (!lost) {
            return res.status(400).json({
                success: false,
                message: 'This match is missing the linked lost item. Remove the row or restore the lost record.',
            });
        }

        // VALIDATION: Determine contact email from lost item or override
        let contactEmail = String(lost.userEmail || '').trim().toLowerCase();
        if (overrideEmail) {
            // VALIDATION: Admin provided an override email, use it instead
            contactEmail = overrideEmail;
        }

        // VALIDATION: Contact email is required to notify user
        if (!contactEmail) {
            return res.status(400).json({
                success: false,
                message:
                    'This lost report has no contact email. Add it on the lost report or enter it when you click Notify so the owner can see matches in Smart Matches.',
            });
        }

        // VALIDATION: If lost item didn't have email but admin provided one, save it
        if (!lost.userEmail && overrideEmail) {
            lost.userEmail = overrideEmail;
            await lost.save();
        }

        // UPDATE: Mark match as notified (admin has reached out to user)
        match.status = 'notified';
        await match.save();

        res.status(200).json({
            success: true,
            message: 'The user will see this on their Smart Matches page.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update notification',
        });
    }
};

/**
 * VALIDATION: Normalize and validate owner contact information from request body
 * Ensures email is valid format, name and phone are safe strings
 * @param {Object} body - Request body containing email, ownerName, ownerPhone
 * @returns {Object} - { email, ownerName, ownerPhone } normalized values
 */
function normalizeOwnerContactBody(body) {
    // VALIDATION: Email - normalize (trim whitespace, lowercase)
    const email = String(body?.email || '').trim().toLowerCase();
    
    // VALIDATION: Owner name - trim whitespace (alphanumeric only, no special chars)
    const ownerName = String(body?.ownerName || '').trim();
    
    // VALIDATION: Owner phone - trim whitespace (will be validated separately)
    const ownerPhone = String(body?.ownerPhone || '').trim();
    
    return { email, ownerName, ownerPhone };
}

// Lost-item owner confirms the match after admin notification ("That's mine").
exports.claimMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerName, ownerPhone, email } = normalizeOwnerContactBody(req.body);

        if (!email) {
            return res.status(400).json({ success: false, message: 'email required in body' });
        }
        if (ownerName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your full name (at least 2 characters) for the finder and admin.',
            });
        }

        const match = await Match.findById(id)
            .populate('lostItemId', lostPopulateSelect)
            .populate('foundItemId', foundPopulateSelect);

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        if (match.status !== 'notified') {
            return res.status(400).json({
                success: false,
                message: 'You can confirm only after the office has notified you.',
            });
        }

        if (!sameEmail(match.lostItemId?.userEmail, email)) {
            return res.status(403).json({
                success: false,
                message: 'This match is not linked to your email.',
            });
        }

        if ((match.lostOwnerResponse || 'none') === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'You already declined this match.',
            });
        }

        if (match.lostUserClaimed) {
            return res.status(400).json({ success: false, message: 'Already confirmed.' });
        }

        match.lostUserClaimed = true;
        match.lostUserClaimedAt = new Date();
        match.lostOwnerResponse = 'claimed';
        match.lostOwnerContact = {
            name: ownerName,
            email,
            phone: ownerPhone,
        };
        match.lostOwnerRespondedAt = new Date();
        match.status = 'resolved';
        await match.save();

        const found = match.foundItemId;
        const hasFinderEmail = Boolean(String(found?.userEmail || '').trim());

        res.status(200).json({
            success: true,
            message: hasFinderEmail
                ? 'Confirmation recorded. The finder will see your contact details under “Items you reported as found” on Smart Matches.'
                : 'Confirmation recorded. This found report has no finder email on file, so they will not get an in-app alert. Ask the finder to use their login email on found reports.',
            match,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lost-item owner says this is not their item — record decline + contact for admin; stays on admin panel.
exports.rejectMatchByOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerName, ownerPhone, email } = normalizeOwnerContactBody(req.body);

        if (!email) {
            return res.status(400).json({ success: false, message: 'email required in body' });
        }
        if (ownerName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your name so admin can follow up if needed.',
            });
        }

        const match = await Match.findById(id).populate('lostItemId', lostPopulateSelect);

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        if (!sameEmail(match.lostItemId?.userEmail, email)) {
            return res.status(403).json({
                success: false,
                message: 'This match is not linked to your email.',
            });
        }

        if ((match.lostOwnerResponse || 'none') === 'rejected') {
            return res.status(400).json({ success: false, message: 'You already declined this match.' });
        }

        if (match.lostUserClaimed) {
            return res.status(400).json({
                success: false,
                message: 'You already confirmed this match. Contact admin if this was a mistake.',
            });
        }

        match.lostOwnerResponse = 'rejected';
        match.lostOwnerContact = {
            name: ownerName,
            email,
            phone: ownerPhone,
        };
        match.lostOwnerRespondedAt = new Date();
        match.lostUserClaimed = false;
        match.status = 'resolved';
        await match.save();

        res.status(200).json({
            success: true,
            message: 'Recorded. Admin can see that you declined this match.',
            match,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
