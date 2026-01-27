const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

module.exports = Contact;
