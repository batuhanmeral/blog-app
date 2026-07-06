const speakeasy = require('speakeasy');
const crypto = require('crypto');
const argon2 = require('argon2');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const config = require('../../config');
const logger = require('../../utils/logger');
const { captureFingerprint } = require('../../middleware/sessionFingerprint');

const loginUrl = () => '/admin/' + config.admin.loginPath;
const ISSUER = process.env.TOTP_ISSUER || 'Crypton';

// Tek kullanımlık 8 haneli yedek kodlar üretir; argon2 ile hash'lenir.
async function generateBackupCodes(n = 10) {
    const plain = Array.from({ length: n }, () => crypto.randomBytes(4).toString('hex'));
    const hashes = await Promise.all(plain.map(c => argon2.hash(c)));
    return { plain, hashes };
}

exports.getLoginPage = (req, res) => {
    const stage = req.session.pendingTotpUserId ? 'totp' : 'password';
    res.render('admin/auth/login', {
        title: 'Giriş',
        loginPath: config.admin.loginPath,
        stage
    });
};

exports.login = async (req, res) => {
    const { username, password, totp } = req.body;

    try {
        let user;
        if (req.session.pendingTotpUserId) {
            user = await User.findById(req.session.pendingTotpUserId);
            if (!user) {
                delete req.session.pendingTotpUserId;
                req.flash('error', 'Oturum süresi doldu, tekrar deneyin.');
                return res.redirect(loginUrl());
            }
        } else {
            user = await User.findOne({ username: String(username || '').toLowerCase() });
            if (!user || !(await user.comparePassword(password))) {
                req.flash('error', 'Kullanıcı adı veya şifre hatalı.');
                return res.redirect(loginUrl());
            }
        }

        if (user.totpEnabled) {
            if (!totp) {
                req.session.pendingTotpUserId = user._id.toString();
                res.locals.loginSucceeded = true;
                return res.redirect(loginUrl());
            }

            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token: String(totp),
                window: 1
            });

            if (!verified) {
                // TOTP tutmadıysa yedek kodları dene (tek kullanımlık)
                const codes = user.totpBackupCodes || [];
                let matched = -1;
                for (let i = 0; i < codes.length; i++) {
                    if (await argon2.verify(codes[i], String(totp).trim())) { matched = i; break; }
                }
                if (matched === -1) {
                    req.flash('error', '2FA kodu hatalı.');
                    return res.redirect(loginUrl());
                }
                user.totpBackupCodes.splice(matched, 1); // kodu tüket
                await user.save();
            }
        }

        const userData = {
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            mustChangePassword: user.mustChangePassword
        };

        delete req.session.pendingTotpUserId;

        req.session.regenerate((err) => {
            if (err) logger.error({ err }, 'Session regenerate failed');

            req.session.user = userData;
            captureFingerprint(req);

            user.lastLoginAt = new Date();
            user.save().catch(e => logger.error({ err: e }, 'lastLoginAt update failed'));

            req.session.save(async (saveErr) => {
                if (saveErr) logger.error({ err: saveErr }, 'Session save failed');

                await AuditLog.log(req, 'LOGIN', {
                    type: 'User',
                    id: user._id,
                    title: user.username
                });

                // loginLimiter yalnızca gerçek giriş başarısını sayaçtan düşsün
                res.locals.loginSucceeded = true;
                res.redirect('/admin/dashboard');
            });
        });
    } catch (err) {
        logger.error({ err }, 'Login error');
        req.flash('error', 'Bir hata oluştu. Tekrar deneyin.');
        res.redirect(loginUrl());
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
    req.session.destroy(() => res.redirect('/'));
};

exports.getTotpSetup = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect('/admin/dashboard');

        if (user.totpEnabled) {
            // Yeni üretilmiş yedek kodlar varsa bir kereliğine göster
            const newCodes = req.session.totpBackupCodesPlain || null;
            delete req.session.totpBackupCodesPlain;
            return res.render('admin/auth/totp', {
                title: 'İki Aşamalı Doğrulama',
                enabled: true,
                otpauthUrl: null,
                qrDataUrl: null,
                backupCount: (user.totpBackupCodes || []).length,
                newCodes
            });
        }

        const secret = speakeasy.generateSecret({
            name: `${ISSUER} (${user.username})`,
            issuer: ISSUER
        });

        req.session.pendingTotpSecret = secret.base32;

        const QRCode = require('qrcode');
        const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.render('admin/auth/totp', {
            title: 'İki Aşamalı Doğrulama',
            enabled: false,
            otpauthUrl: secret.otpauth_url,
            qrDataUrl,
            base32: secret.base32
        });
    } catch (err) {
        logger.error({ err }, 'TOTP setup error');
        res.status(500).send('Hata');
    }
};

exports.enableTotp = async (req, res) => {
    try {
        const secret = req.session.pendingTotpSecret;
        if (!secret) {
            req.flash('error', '2FA kurulumu başlatılmadı.');
            return res.redirect('/admin/2fa');
        }

        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: String(req.body.token),
            window: 1
        });

        if (!verified) {
            req.flash('error', 'Kod hatalı, tekrar deneyin.');
            return res.redirect('/admin/2fa');
        }

        const { plain, hashes } = await generateBackupCodes();
        await User.findByIdAndUpdate(req.session.user.id, {
            totpSecret: secret,
            totpEnabled: true,
            totpBackupCodes: hashes
        });

        delete req.session.pendingTotpSecret;
        req.session.totpBackupCodesPlain = plain; // /admin/2fa'da bir kez gösterilecek
        req.flash('success', '2FA etkinleştirildi. Yedek kodlarınızı güvenli bir yere kaydedin.');
        res.redirect('/admin/2fa');
    } catch (err) {
        logger.error({ err }, 'enableTotp error');
        res.status(500).send('Hata');
    }
};

exports.disableTotp = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.user.id, {
            totpSecret: null,
            totpEnabled: false,
            totpBackupCodes: []
        });
        req.flash('success', '2FA devre dışı bırakıldı.');
        res.redirect('/admin/2fa');
    } catch (err) {
        logger.error({ err }, 'disableTotp error');
        res.status(500).send('Hata');
    }
};

exports.regenerateBackupCodes = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user || !user.totpEnabled) {
            req.flash('error', 'Önce 2FA etkinleştirmelisiniz.');
            return res.redirect('/admin/2fa');
        }
        const { plain, hashes } = await generateBackupCodes();
        user.totpBackupCodes = hashes;
        await user.save();
        req.session.totpBackupCodesPlain = plain;
        req.flash('success', 'Yeni yedek kodlar üretildi. Eski kodlar artık geçersiz.');
        res.redirect('/admin/2fa');
    } catch (err) {
        logger.error({ err }, 'regenerateBackupCodes error');
        res.status(500).send('Hata');
    }
};
