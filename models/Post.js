const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        unique: true
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING
    },
    summary: {
        type: Sequelize.STRING
    },
    seoTitle: {
        type: Sequelize.STRING(70),
        allowNull: true
    },
    seoDescription: {
        type: Sequelize.STRING(160),
        allowNull: true
    },
    seoKeywords: {
        type: Sequelize.STRING,
        allowNull: true
    },
    ogImage: {
        type: Sequelize.STRING,
        allowNull: true
    },
    viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    readTime: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

Post.generateSlug = (title) => {
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

Post.calculateReadTime = (content) => {
    const plainText = content.replace(/<[^>]+>/g, '').replace(/[#*`]/g, '');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
};

module.exports = Post;
