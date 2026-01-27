const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 254,
        default: ''
    },
    body: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 3000
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'spam'],
        default: 'pending',
        index: true
    },
    ipHash: String,
    userAgent: String
}, {
    timestamps: true
});

commentSchema.index({ post: 1, status: 1, createdAt: -1 });
commentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
