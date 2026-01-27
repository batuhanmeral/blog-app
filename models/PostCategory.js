const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const PostCategory = sequelize.define('PostCategory', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    timestamps: false
});

module.exports = PostCategory;
