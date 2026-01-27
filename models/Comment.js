const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Posts',
            key: 'id'
        }
    },
    status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

module.exports = Comment;
