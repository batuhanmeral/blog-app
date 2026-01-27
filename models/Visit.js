const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    day: {
        type: String,
        required: true,
        index: true
    },
    ipHash: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 365
    }
});

visitSchema.index({ day: 1, postId: 1 });
// Tek ziyaretçi/gün/yazı tekilliği — upsert ile race-condition'a karşı garanti.
// Partial: yalnızca ipHash'i olan kayıtlar (eski/boş kayıtlardaki null çakışmasını önler).
visitSchema.index(
    { postId: 1, day: 1, ipHash: 1 },
    { unique: true, partialFilterExpression: { ipHash: { $exists: true } } }
);

module.exports = mongoose.model('Visit', visitSchema);
