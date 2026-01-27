const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

// Bağlantıyı kurar; hata olursa fırlatır — süreç sonlandırma kararını
// çağıran (app.js) verir. Böylece çift exit mantığı ortadan kalkar.
const connectDB = async () => {
    return mongoose.connect(config.database.uri, config.database.options);
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB error');
});

module.exports = { connectDB, mongoose };
