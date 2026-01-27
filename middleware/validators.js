const { body, param, query, validationResult } = require('express-validator');

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function handleResult(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const wantsJson = req.xhr || req.is('application/json') ||
        (req.get('accept') || '').includes('application/json');

    const list = errors.array();
    const message = list.map(e => e.msg).join(' • ');

    if (wantsJson) {
        return res.status(400).json({ errors: list });
    }

    if (req.flash) req.flash('error', message);
    return res.redirect('back');
}

const validate = (chains) => [...chains, handleResult];

const objectIdParam = (name) =>
    param(name).matches(OBJECT_ID).withMessage(`Geçersiz ${name}.`);

const rules = {
    login: [
        // username/password yalnızca 1. aşamada (TOTP beklenmiyorken) zorunludur.
        // TOTP aşamasında form sadece `totp` gönderir; kullanıcı session'dan çözülür.
        body('username')
            .if((value, { req }) => !req.session.pendingTotpUserId)
            .trim().notEmpty().withMessage('Kullanıcı adı zorunlu.')
            .isLength({ max: 64 }).withMessage('Kullanıcı adı çok uzun.'),
        body('password')
            .if((value, { req }) => !req.session.pendingTotpUserId)
            .isString().notEmpty().withMessage('Parola zorunlu.')
            .isLength({ max: 128 }).withMessage('Parola çok uzun.'),
        body('totp').optional({ checkFalsy: true }).isString().isLength({ min: 6, max: 8 })
    ],

    profile: [
        body('username').trim().toLowerCase()
            .matches(/^[a-z0-9_]{3,32}$/).withMessage('Kullanıcı adı 3-32 karakter ve yalnızca harf/rakam/alt çizgi.'),
        body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Ad Soyad zorunlu ve max 80 karakter.'),
        body('password').optional({ checkFalsy: true })
            .isString().isLength({ min: 8, max: 128 }).withMessage('Parola 8-128 karakter olmalı.')
            .matches(/[A-Za-z]/).withMessage('Parola en az bir harf içermeli.')
            .matches(/[0-9]/).withMessage('Parola en az bir rakam içermeli.')
    ],

    contact: [
        body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Ad Soyad 2-100 karakter olmalı.'),
        body('email').trim().isEmail().withMessage('Geçerli bir e-posta girin.').isLength({ max: 254 }).normalizeEmail(),
        body('message').trim().isLength({ min: 5, max: 5000 }).withMessage('Mesaj 5-5000 karakter olmalı.'),
        body('website').optional({ checkFalsy: true }).isLength({ max: 0 })
    ],

    comment: [
        body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Ad 2-80 karakter olmalı.'),
        body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Geçerli bir e-posta girin.').isLength({ max: 254 }).normalizeEmail(),
        body('body').trim().isLength({ min: 5, max: 3000 }).withMessage('Yorum 5-3000 karakter olmalı.'),
        body('website').optional({ checkFalsy: true }).isLength({ max: 0 }) // honeypot
    ],

    postCreate: [
        body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Başlık 1-200 karakter olmalı.'),
        body('content').isString().isLength({ min: 1, max: 200000 }).withMessage('İçerik boş olamaz.'),
        body('summary').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
        body('status').optional().isIn(['draft', 'published']).withMessage('Geçersiz durum.'),
        body('imageAlt').optional({ checkFalsy: true }).trim().isLength({ max: 160 }),
        body('seoTitle').optional({ checkFalsy: true }).trim().isLength({ max: 70 }),
        body('seoDescription').optional({ checkFalsy: true }).trim().isLength({ max: 160 }),
        body('tags').optional({ checkFalsy: true }).isString().isLength({ max: 500 }).withMessage('Etiketler çok uzun.'),
        body('categories').optional().customSanitizer(v => Array.isArray(v) ? v : (v ? [v] : []))
            .custom(arr => arr.every(id => OBJECT_ID.test(String(id)))).withMessage('Geçersiz kategori.')
    ],

    category: [
        body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Kategori adı 1-50 karakter.'),
        body('color').optional({ checkFalsy: true }).matches(/^#[0-9a-fA-F]{6}$/).withMessage('Renk #RRGGBB biçiminde olmalı.')
    ],

    userCreate: [
        body('username').trim().toLowerCase()
            .matches(/^[a-z0-9_]{3,32}$/).withMessage('Kullanıcı adı 3-32 karakter ve yalnızca harf/rakam/alt çizgi.'),
        body('name').trim().isLength({ min: 1, max: 80 }),
        body('password').isString().isLength({ min: 8, max: 128 })
            .matches(/[A-Za-z]/).matches(/[0-9]/).withMessage('Parola en az 1 harf + 1 rakam içermeli.'),
        body('role').isIn(['admin', 'editor', 'author']).withMessage('Geçersiz rol.')
    ],

    userUpdate: [
        body('name').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
        body('role').optional().isIn(['admin', 'editor', 'author']).withMessage('Geçersiz rol.'),
        body('password').optional({ checkFalsy: true })
            .isLength({ min: 8, max: 128 }).matches(/[A-Za-z]/).matches(/[0-9]/)
    ],

    bulkPosts: [
        body('ids').customSanitizer(v => Array.isArray(v) ? v : (v ? [v] : []))
            .custom(arr => arr.length > 0 && arr.every(id => OBJECT_ID.test(String(id))))
            .withMessage('Geçersiz seçim.'),
        body('action').isIn(['publish', 'draft', 'delete']).withMessage('Geçersiz işlem.')
    ],

    totpVerify: [
        body('token').isString().isLength({ min: 6, max: 8 }).withMessage('TOTP kodu 6-8 hanedir.')
    ],

    objectIdParam,
    handleResult,
    validate
};

module.exports = rules;
