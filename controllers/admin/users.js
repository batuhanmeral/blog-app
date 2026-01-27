const User = require('../../models/User');
const Post = require('../../models/Post');
const Media = require('../../models/Media');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');

exports.getProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).lean();
        res.render('admin/profile', { title: 'Profilim', user });
    } catch (err) {
        logger.error({ err }, 'getProfilePage');
        res.status(500).send('Hata');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).send('Kullanıcı bulunamadı');

        if (req.body.username !== user.username) {
            const exists = await User.findOne({ username: req.body.username, _id: { $ne: user._id } });
            if (exists) {
                req.flash('error', 'Bu kullanıcı adı zaten alınmış.');
                return res.redirect('/admin/profile');
            }
        }

        user.username = req.body.username;
        user.name = req.body.name;
        if (req.body.password) {
            user.password = req.body.password;
            user.mustChangePassword = false; // kendi parolasını değiştirdi
        }

        await user.save();

        req.session.user = {
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            mustChangePassword: user.mustChangePassword
        };

        await AuditLog.log(req, 'UPDATE_PROFILE', { type: 'User', id: user._id, title: user.username });
        req.flash('success', 'Profil güncellendi.');
        res.redirect('/admin/profile');
    } catch (err) {
        logger.error({ err }, 'updateProfile');
        res.status(500).send('Güncelleme hatası');
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const me = await User.findById(req.session.user.id);
        if (!me) return res.redirect('/');

        // Son admin kendini silip sistemi kilitleyemesin
        if (me.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                req.flash('error', 'Son admin hesabı silinemez. Önce başka bir admin atayın.');
                return res.redirect('/admin/profile');
            }
        }

        await me.deleteOne();
        await AuditLog.log(req, 'DELETE_PROFILE', { type: 'User', id: me._id, title: me.username });

        req.session.destroy(() => res.redirect('/'));
    } catch (err) {
        logger.error({ err }, 'deleteProfile');
        res.status(500).send('Hesap silinemedi');
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -totpSecret -totpBackupCodes').sort({ createdAt: -1 }).lean();
        res.render('admin/users/list', { title: 'Kullanıcılar', users });
    } catch (err) {
        logger.error({ err }, 'listUsers');
        res.status(500).send('Hata');
    }
};

exports.getAddUserPage = (req, res) => {
    res.render('admin/users/add', { title: 'Yeni Kullanıcı', roles: User.ROLES });
};

exports.createUser = async (req, res) => {
    try {
        const existing = await User.findOne({ username: req.body.username });
        if (existing) {
            req.flash('error', 'Bu kullanıcı adı zaten kullanılıyor.');
            return res.redirect('/admin/users/add');
        }

        const user = await User.create({
            username: req.body.username,
            name: req.body.name,
            password: req.body.password,
            role: req.body.role,
            // Admin'in verdiği parola geçici sayılır; kullanıcı ilk girişte değiştirir
            mustChangePassword: true
        });

        await AuditLog.log(req, 'UPDATE_SETTINGS', { type: 'User', id: user._id, title: 'Created ' + user.username });
        req.flash('success', 'Kullanıcı oluşturuldu.');
        res.redirect('/admin/users');
    } catch (err) {
        logger.error({ err }, 'createUser');
        res.status(500).send('Hata');
    }
};

exports.getEditUserPage = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -totpSecret -totpBackupCodes').lean();
        if (!user) return res.status(404).send('Kullanıcı bulunamadı');
        res.render('admin/users/edit', { title: 'Kullanıcıyı Düzenle', editUser: user, roles: User.ROLES });
    } catch (err) {
        logger.error({ err }, 'getEditUserPage');
        res.status(500).send('Hata');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('Kullanıcı bulunamadı');

        if (typeof req.body.name === 'string') user.name = req.body.name;

        if (req.body.role && req.body.role !== user.role) {
            if (user.role === 'admin' && req.body.role !== 'admin') {
                const adminCount = await User.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    req.flash('error', 'Son admin kullanıcının rolü değiştirilemez.');
                    return res.redirect('/admin/users');
                }
            }
            user.role = req.body.role;
        }

        if (req.body.password) {
            user.password = req.body.password;
            // Admin başkasının parolasını sıfırladı → o kullanıcı yeniden değiştirsin
            if (String(user._id) !== String(req.session.user.id)) {
                user.mustChangePassword = true;
            }
        }

        await user.save();
        await AuditLog.log(req, 'UPDATE_SETTINGS', { type: 'User', id: user._id, title: 'Updated ' + user.username });
        req.flash('success', 'Kullanıcı güncellendi.');
        res.redirect('/admin/users');
    } catch (err) {
        logger.error({ err }, 'updateUser');
        res.status(500).send('Hata');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('Kullanıcı bulunamadı');

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                req.flash('error', 'Son admin kullanıcı silinemez.');
                return res.redirect('/admin/users');
            }
        }

        if (String(user._id) === String(req.session.user.id)) {
            req.flash('error', 'Kendi hesabınızı buradan silemezsiniz; profil sayfasını kullanın.');
            return res.redirect('/admin/users');
        }

        // İçerik kaybolmasın: silinen kullanıcının yazı ve medyasını işlemi yapan admin'e devret
        await Promise.all([
            Post.updateMany({ author: user._id }, { author: req.session.user.id }),
            Media.updateMany({ uploadedBy: user._id }, { uploadedBy: req.session.user.id })
        ]);

        await user.deleteOne();
        await AuditLog.log(req, 'UPDATE_SETTINGS', { type: 'User', id: user._id, title: 'Deleted ' + user.username });
        req.flash('success', 'Kullanıcı silindi.');
        res.redirect('/admin/users');
    } catch (err) {
        logger.error({ err }, 'deleteUser');
        res.status(500).send('Hata');
    }
};
