const config = require('../config');

const loginUrl = () => `/admin/${config.admin.loginPath || 'login'}`;

function hasRole(...roles) {
    return function (req, res, next) {
        if (!req.session || !req.session.user) {
            return res.redirect(loginUrl());
        }
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).render('errors/403', {
                title: 'Yetkisiz',
                message: 'Bu işlem için yetkiniz yok.'
            });
        }
        next();
    };
}

const isAdmin = hasRole('admin');
const isEditor = hasRole('admin', 'editor');
const isAuthor = hasRole('admin', 'editor', 'author');

// admin/editor her kaynağı yönetebilir; author yalnızca kendi kaynağını.
// Sahibi olmayan (author alanı boş) eski kayıtları author değiştiremez.
function canMutate(resourceOwnerId, user) {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    return Boolean(resourceOwnerId) && String(resourceOwnerId) === String(user.id);
}

module.exports = { hasRole, isAdmin, isEditor, isAuthor, canMutate };
