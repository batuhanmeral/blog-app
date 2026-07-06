const path = require('path');

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const isProd = env === 'production';
const isTest = env === 'test';
const config = {
    env,
    isDev,
    isProd,
    isTest,

    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',

    trustProxy: (() => {
        const raw = process.env.TRUST_PROXY;
        if (raw === undefined || raw === '') return isProd ? 1 : false;
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        const n = parseInt(raw, 10);
        return Number.isNaN(n) ? raw : n;
    })(),

    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypton',
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        }
    },

    session: {
        secret: process.env.SESSION_SECRET || 'dev_secret_change_in_production',
        name: 'blog.sid',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            // 'auto': cookie yalnızca bağlantı gerçekten HTTPS ise Secure olur
            // (TLS proxy arkasında X-Forwarded-Proto + trust proxy ile algılanır).
            // Böylece prod'da HTTPS'te güvenli, yerel HTTP erişiminde de çalışır.
            secure: 'auto',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    },

    security: {
        bcryptRounds: 10
    },

    upload: {
        uploadDir: process.env.DATA_PATH
            ? path.join(process.env.DATA_PATH, 'uploads')
            : path.join(__dirname, '../public/assets/uploads/')
    },

    app: {
        name: 'Crypton',
        description: 'Siber güvenlik üzerine yazılar ve teknik analizler'
    },

    cache: {
        maxAge: isProd ? '7d' : '0'
    },

    admin: {
        loginPath: process.env.ADMIN_LOGIN_PATH || 'login'
    }
};

if (isProd) {
    const requiredEnvVars = ['SESSION_SECRET', 'MONGODB_URI'];
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing.join(', '));
        process.exit(1);
    }

    if (process.env.SESSION_SECRET === 'dev_secret_change_in_production') {
        console.error('Please set a secure SESSION_SECRET in production!');
        process.exit(1);
    }
}

module.exports = config;

