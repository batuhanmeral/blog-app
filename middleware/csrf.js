const crypto = require('crypto');

const ensureToken = (req) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    return req.session.csrfToken;
};

const injectToken = (req, res, next) => {
    if (!req.session) return next();
    res.locals.csrfToken = ensureToken(req);
    next();
};

const isSafeMethod = (method) => ['GET', 'HEAD', 'OPTIONS'].includes(method);

const safeEqual = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
};

const verifyToken = (req, res, next) => {
    if (isSafeMethod(req.method)) return next();
    if (!req.session) return next();

    const expected = req.session.csrfToken;
    const provided = (req.body && req.body._csrf) || req.get('x-csrf-token') || req.get('x-xsrf-token');

    if (!expected || !provided || !safeEqual(expected, provided)) {
        if (req.xhr || req.is('application/json') || req.get('accept')?.includes('application/json')) {
            return res.status(403).json({ error: 'Geçersiz CSRF token.' });
        }
        return res.status(403).render('errors/403', {
            title: 'Yetkisiz İşlem',
            message: 'Oturumunuz sona ermiş veya form süresi dolmuş olabilir. Lütfen sayfayı yenileyip tekrar deneyin.'
        });
    }

    next();
};

module.exports = {
    injectToken,
    verifyToken,
    ensureToken
};
