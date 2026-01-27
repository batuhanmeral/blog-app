const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const bcrypt = require('bcrypt');

exports.getLoginPage = (req, res) => {
    res.render('admin/auth/login', { title: 'Yönetici Girişi' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).send('Kullanıcı bulunamadı');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Hatalı şifre');

        const userData = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        };

        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regenerate hatası:', err);
                req.session.user = userData;
                return req.session.save(() => res.redirect('/admin/dashboard'));
            }
            
            req.session.user = userData;
            req.session.save(async (saveErr) => {
                if (saveErr) console.error('Session save hatası:', saveErr);
                
                await AuditLog.log(req, 'LOGIN', {
                    type: 'User',
                    id: user.id,
                    title: user.username
                });
                
                res.redirect('/admin/dashboard');
            });
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Bir hata oluştu');
    }
};

exports.logout = async (req, res) => {
    if (req.session?.user) {
        await AuditLog.log(req, 'LOGOUT', {
            type: 'User',
            id: req.session.user.id,
            title: req.session.user.username
        });
    }
    
    req.session.destroy(() => {
        res.redirect('/');
    });
};
