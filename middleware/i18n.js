const { SUPPORTED, DEFAULT_LOCALE, translate } = require('../locales');

// Accept-Language başlığından basit dil tahmini (oturum tercihi yoksa).
function detectFromHeader(req) {
    const al = (req.headers['accept-language'] || '').toLowerCase();
    const en = al.indexOf('en');
    const tr = al.indexOf('tr');
    if (en !== -1 && (tr === -1 || en < tr)) return 'en';
    return DEFAULT_LOCALE;
}

function i18n(req, res, next) {
    // ?lang=tr|en → oturuma yaz ve parametreyi temizleyip yönlendir
    if (req.query.lang && SUPPORTED.includes(req.query.lang)) {
        if (req.session) req.session.locale = req.query.lang;
        const q = { ...req.query };
        delete q.lang;
        const qs = new URLSearchParams(q).toString();
        return res.redirect(req.path + (qs ? '?' + qs : ''));
    }

    const locale = (req.session && SUPPORTED.includes(req.session.locale))
        ? req.session.locale
        : detectFromHeader(req);

    req.locale = locale;
    req.t = (key, vars) => translate(locale, key, vars);

    res.locals.locale = locale;
    res.locals.supportedLocales = SUPPORTED;
    res.locals.t = req.t;
    res.locals.urlForLang = (lang) => {
        const q = { ...req.query, lang };
        return req.path + '?' + new URLSearchParams(q).toString();
    };

    next();
}

module.exports = i18n;
