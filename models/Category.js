const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: Sequelize.STRING,
        unique: true
    },
    color: {
        type: Sequelize.STRING,
        defaultValue: '#10b981'
    }
});

Category.generateSlug = (name) => {
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

module.exports = Category;
