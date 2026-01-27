const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/admin/login');
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).render('errors/403', { 
            title: 'Erişim Engellendi',
            message: 'Bu işlem için admin yetkisi gereklidir.'
        });
    }
    next();
};

const isGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/admin/dashboard');
    }
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest
};
