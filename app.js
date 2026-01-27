require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const compression = require('compression');
const pinoHttp = require('pino-http');

const config = require('./config');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const { generalLimiter, sanitizeInput } = require('./middleware/security');
const { nonceMiddleware, helmetWithNonce } = require('./middleware/csp');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { injectToken: injectCsrfToken } = require('./middleware/csrf');
const i18n = require('./middleware/i18n');

const app = express();

if (config.isProd) app.set('trust proxy', 1);

app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url.startsWith('/assets/') } }));

app.use(nonceMiddleware);
app.use(helmetWithNonce);
app.use(compression());
app.use(generalLimiter);

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const staticOpts = {
    maxAge: config.isProd ? ONE_YEAR : 0,
    etag: true,
    immutable: config.isProd,
    lastModified: true
};

app.use(express.static('public', staticOpts));

if (process.env.DATA_PATH) {
    app.use('/assets/uploads', express.static(path.join(process.env.DATA_PATH, 'uploads'), staticOpts));
}

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    ...config.session,
    store: MongoStore.create({
        mongoUrl: config.database.uri,
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60
    })
}));

app.use(injectCsrfToken);

app.use((req, res, next) => {
    req.flash = (type, message) => {
        if (type === 'success') req.session.flashSuccess = message;
        else if (type === 'error') req.session.flashError = message;
    };
    next();
});

app.use(i18n);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    res.locals.query = req.query;
    res.locals.flash = {
        success: req.session.flashSuccess,
        error: req.session.flashError
    };
    delete req.session.flashSuccess;
    delete req.session.flashError;

    res.locals.helpers = {
        formatDate: (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '',
        formatDateTime: (d) => d ? new Date(d).toLocaleString('tr-TR') : '',
        truncate: (s, n = 100) => !s ? '' : (s.length > n ? s.substring(0, n) + '...' : s)
    };

    res.locals.app = {
        name: config.app.name,
        description: config.app.description,
        year: new Date().getFullYear(),
        url: process.env.SITE_URL || `${req.protocol}://${req.get('host')}`
    };

    res.locals.adminLoginPath = `/admin/${config.admin.loginPath || 'login'}`;

    next();
});

connectDB()
    .then(() => logger.info({ env: config.env }, 'Database connected'))
    .catch(err => {
        logger.fatal({ err }, 'Database connection error');
        process.exit(1);
    });

const webRoutes = require('./routes/web');
const adminRoutes = require('./routes/admin');

app.use('/admin', adminRoutes);
app.use('/', webRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = config.port;
const HOST = config.host;

const server = app.listen(PORT, HOST, () => {
    logger.info({ host: HOST, port: PORT, env: config.env }, 'Server started');
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection');
});

module.exports = app;
