const path = require('path');

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const isProd = env === 'production';
const isTest = env === 'test';
const dataPath = process.env.DATA_PATH || path.join(__dirname, '..');

const config = {
    env,
    isDev,
    isProd,
    isTest,
    
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',
    
    database: {
        dialect: 'sqlite',
        storage: path.join(dataPath, 'database.sqlite'),
        logging: isDev ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    
    session: {
        secret: process.env.SESSION_SECRET || 'dev_secret_change_in_production',
        name: 'zeroday.sid',
        resave: true,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }
    },
    
    security: {
        bcryptRounds: 10,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: isProd ? 100 : 1000
        },
        loginRateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 5
        }
    },
    
    upload: {
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        uploadDir: process.env.DATA_PATH 
            ? path.join(process.env.DATA_PATH, 'uploads') 
            : path.join(__dirname, '../public/assets/uploads/')
    },
    
    app: {
        name: 'ZeroDay Platform',
        url: process.env.APP_URL || 'http://localhost:3000',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@zerodayplatform.com'
    },
    
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    },
    
    cache: {
        maxAge: isProd ? '7d' : '0'
    }
};

if (isProd) {
    const requiredEnvVars = ['SESSION_SECRET'];
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
