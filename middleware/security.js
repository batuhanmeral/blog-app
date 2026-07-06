const rateLimit = require('express-rate-limit');

// Not: CSP/Helmet yapılandırması nonce desteğiyle middleware/csp.js içindedir.
// Burada yalnızca rate limiter'lar ve girdi trimleme bulunur.

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path.startsWith('/assets/');
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    // Başarısız girişler 302 redirect döndürdüğü için varsayılan
    // (statusCode < 400) "başarılı" sayımı sayacı sıfırlardı. Yalnızca
    // controller'ın işaretlediği GERÇEK giriş başarısı sayaçtan düşülsün.
    requestWasSuccessful: (req, res) => res.locals.loginSucceeded === true
});

const commentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        error: 'Çok fazla yorum gönderdiniz. Lütfen biraz sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

function trimStringsDeep(value) {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(trimStringsDeep);
    if (value && typeof value === 'object') {
        for (const key of Object.keys(value)) {
            value[key] = trimStringsDeep(value[key]);
        }
    }
    return value;
}

const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        trimStringsDeep(req.body);
    }
    next();
};

module.exports = {
    generalLimiter,
    loginLimiter,
    commentLimiter,
    sanitizeInput
};
