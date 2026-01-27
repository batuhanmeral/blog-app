require('dotenv').config();

const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const compression = require('compression');

const config = require('./config');
const { sequelize } = require('./models');

const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'Sessions',
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000
});

const { helmetConfig, generalLimiter, sanitizeInput } = require('./middleware/security');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

if (config.isProd) {
    app.set('trust proxy', 1);
}

app.use(helmetConfig);
app.use(compression());
app.use(generalLimiter);

app.use(express.static('public', {
    maxAge: config.cache.maxAge,
    etag: true
}));

if (process.env.DATA_PATH) {
    app.use('/assets/uploads', express.static(path.join(process.env.DATA_PATH, 'uploads'), {
        maxAge: config.cache.maxAge,
        etag: true
    }));
}

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    ...config.session,
    store: sessionStore
}));

sessionStore.sync();

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
        formatDate: (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('tr-TR');
        },
        formatDateTime: (date) => {
            if (!date) return '';
            return new Date(date).toLocaleString('tr-TR');
        },
        truncate: (str, len = 100) => {
            if (!str) return '';
            return str.length > len ? str.substring(0, len) + '...' : str;
        }
    };
    
    res.locals.app = {
        name: config.app.name,
        year: new Date().getFullYear()
    };
    
    next();
});

app.use((req, res, next) => {
    req.flash = (type, message) => {
        if (type === 'success') {
            req.session.flashSuccess = message;
        } else if (type === 'error') {
            req.session.flashError = message;
        }
    };
    next();
});

sequelize.sync()
    .then(() => {
        console.log('Database connected (' + config.env + ')');
    })
    .catch(err => {
        console.error('Database connection error:', err);
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
    console.log('ZeroDay Platform Started');
    console.log('Environment: ' + config.env);
    console.log('URL: http://' + HOST + ':' + PORT);
});

process.on('SIGTERM', () => {
    server.close(() => {
        sequelize.close().then(() => {
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    server.close(() => {
        sequelize.close().then(() => {
            process.exit(0);
        });
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
