const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 254,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Geçerli bir e-posta adresi giriniz.']
    },
    message: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5000
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
