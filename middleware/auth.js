const config = require('../config');

const loginUrl = () => `/admin/${config.admin.loginPath || 'login'}`;

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect(loginUrl());
    }
    next();
};

const isGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/admin/dashboard');
    }
    next();
};

// Parola değiştirmesi zorunlu kullanıcıyı profil sayfasına kilitler
// (yalnızca profil ve çıkış erişilebilir kalır).
const enforcePasswordChange = (req, res, next) => {
    if (!req.session.user || !req.session.user.mustChangePassword) return next();
    if (req.path === '/profile' || req.path === '/logout') return next();
    if (req.flash) req.flash('error', 'Devam etmeden önce parolanızı değiştirmelisiniz.');
    return res.redirect('/admin/profile');
};

module.exports = {
    isAuthenticated,
    isGuest,
    enforcePasswordChange
};
