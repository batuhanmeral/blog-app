const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    color: {
        type: String,
        default: '#10b981'
    },
    archived: {
        type: Boolean,
        default: false,
        index: true
    },
    archivedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

categorySchema.statics.generateSlug = function (name) {
    return name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

module.exports = mongoose.model('Category', categorySchema);
