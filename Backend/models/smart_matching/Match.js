const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    lostItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LostItem',
        required: true
    },
    foundItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoundItem',
        required: true
    },
    // Backward-compat overall score (0..100). Kept for existing UI/records.
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    // New scoring fields (per spec)
    inputScore: {
        type: Number,
        default: 0
    },      // 0..60

    imageScore: { 
        type: Number,
        default: 0 
    },      // 0..40

    overallScore: { 
        type: Number,
        default: 0 
    },    // 0..100

    // Legacy field (kept so older code doesn't break)
    
    ruleScore: { 
        type: Number,
        default: 0 
    },
    imageSimilarity: {
        type: Number,
        default: null
    },
    // imageScore moved above (kept same key name)
    imageAiStatus: {
        type: String,
        default: 'not_checked'
    },
    status: {
        type: String,
        enum: ['pending', 'notified', 'resolved'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);