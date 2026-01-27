const Media = require('../../models/Media');
const AuditLog = require('../../models/AuditLog');
const fs = require('fs').promises;
const logger = require('../../utils/logger');
const { canMutate } = require('../../middleware/authorize');

exports.getMedia = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 24;
        const skip = (page - 1) * limit;

        const [media, total] = await Promise.all([
            Media.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Media.countDocuments()
        ]);

        const totalPages = Math.ceil(total / limit);

        res.render('admin/media/list', {
            title: 'Medya Kütüphanesi',
            media,
            currentPage: page,
            totalPages,
            total
        });
    } catch (err) {
        logger.error({ err }, 'getMedia');
        req.flash('error', 'Medya listesi yüklenirken hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

exports.uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Dosya seçilmedi.' });
        }

        const media = await Media.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/assets/uploads/${req.file.filename}`,
            alt: req.body.alt || '',
            uploadedBy: req.session.user.id
        });

        await AuditLog.log(req, 'MEDIA_UPLOAD', {
            type: 'Media',
            id: media._id,
            title: media.originalName
        });

        res.json({
            success: true,
            media: {
                _id: media._id,
                url: media.url,
                filename: media.filename,
                originalName: media.originalName
            }
        });
    } catch (err) {
        logger.error({ err }, 'uploadMedia');
        res.status(500).json({ error: 'Dosya yüklenirken hata oluştu.' });
    }
};

exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            req.flash('error', 'Medya bulunamadı.');
            return res.redirect('/admin/media');
        }

        if (!canMutate(media.uploadedBy, req.session.user)) {
            req.flash('error', 'Bu medyayı silme yetkiniz yok.');
            return res.redirect('/admin/media');
        }

        // Delete file from disk
        try {
            await fs.unlink(media.path);
        } catch (err) {
            logger.warn({ err }, 'media file unlink failed');
        }

        await media.deleteOne();

        await AuditLog.log(req, 'MEDIA_DELETE', {
            type: 'Media',
            id: media._id,
            title: media.originalName
        });

        req.flash('success', 'Medya silindi.');
        res.redirect('/admin/media');
    } catch (err) {
        logger.error({ err }, 'deleteMedia');
        req.flash('error', 'Medya silinirken hata oluştu.');
        res.redirect('/admin/media');
    }
};

// API for media picker in editor
exports.getMediaApi = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 }).limit(50);
        res.json(media);
    } catch (err) {
        logger.error({ err }, 'getMediaApi');
        res.status(500).json({ error: 'Medya yüklenirken hata oluştu.' });
    }
};
