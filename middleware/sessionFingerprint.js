const crypto = require('crypto');
const logger = require('../utils/logger');
const config = require('../config');

const loginUrl = () => `/admin/${config.admin.loginPath || 'login'}`;

function ipPrefix(ip) {
    if (!ip) return '';
    if (ip.includes(':')) {
        const parts = ip.split(':');
        return parts.slice(0, 4).join(':');
    }
    const parts = ip.split('.');
    return parts.slice(0, 3).join('.');
}

function fingerprint(req) {
    const ua = req.get('user-agent') || '';
    const ip = ipPrefix(req.ip || '');
    return crypto.createHash('sha256').update(ua + '|' + ip).digest('hex');
}

function captureFingerprint(req) {
    if (req.session) {
        req.session.fingerprint = fingerprint(req);
    }
}

function verifyFingerprint(req, res, next) {
    if (!req.session || !req.session.user) return next();

    const stored = req.session.fingerprint;
    const current = fingerprint(req);

    if (!stored) {
        req.session.fingerprint = current;
        return next();
    }

    if (stored !== current) {
        logger.warn({
            userId: req.session.user.id,
            username: req.session.user.username,
            ip: req.ip,
            ua: req.get('user-agent')
        }, 'Session fingerprint mismatch — forcing re-login');

        return req.session.destroy(() => {
            res.redirect(loginUrl());
        });
    }

    next();
}

module.exports = { fingerprint, captureFingerprint, verifyFingerprint };
