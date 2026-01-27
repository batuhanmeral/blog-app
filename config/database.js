const Sequelize = require('sequelize');
const path = require('path');

const config = require('./index');

const sequelize = new Sequelize({
    dialect: config.database.dialect,
    storage: config.database.storage,
    logging: config.database.logging,
    pool: config.database.pool,
    define: {
        timestamps: true,
        underscored: false
    }
});

module.exports = sequelize;
