const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    imageAlt: {
        type: String,
        default: '',
        maxlength: 160
    },
    summary: {
        type: String,
        maxlength: 300
    },
    seoTitle: {
        type: String,
        maxlength: 70
    },
    seoDescription: {
        type: String,
        maxlength: 160
    },
    seoKeywords: {
        type: String
    },
    ogImage: {
        type: String
    },
    viewCount: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number,
        default: 1
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: {
        type: [String],
        default: [],
        index: true
    }
}, {
    timestamps: true
});

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ 'categories': 1 });
postSchema.index({ author: 1 });
// Tam metin arama. Türkçe MongoDB'de desteklenmediğinden default_language:'none'
// ile stemming/stop-word kapatılır (Türkçe kelimeler bozulmadan eşleşir).
postSchema.index(
    { title: 'text', summary: 'text', content: 'text', tags: 'text' },
    { weights: { title: 10, tags: 6, summary: 4, content: 1 }, name: 'post_search', default_language: 'none' }
);

postSchema.statics.generateSlug = function (title) {
    return title
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

postSchema.statics.calculateReadTime = function (content) {
    const plainText = content.replace(/<[^>]+>/g, '').replace(/[#*`]/g, '');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
};

module.exports = mongoose.model('Post', postSchema);
