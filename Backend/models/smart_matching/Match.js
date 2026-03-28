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
    matchScore: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'notified', 'resolved'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);