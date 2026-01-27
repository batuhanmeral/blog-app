const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const sharp = require('sharp');
const config = require('../config');
const logger = require('../utils/logger');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 2400;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = config.upload.uploadDir;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const id = crypto.randomBytes(8).toString('hex');
        const ts = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${ts}-${id}${ext}`);
    }
});

const imageFilter = (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Sadece resim dosyaları yüklenebilir (jpg, png, gif, webp)'), false);
};

const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: MAX_IMAGE_SIZE }
});

async function processImage(req, res, next) {
    if (!req.file) return next();
    if (req.file.mimetype === 'image/gif') {
        req.file.processedUrl = '/assets/uploads/' + req.file.filename;
        return next();
    }

    try {
        const srcPath = req.file.path;
        const base = path.basename(srcPath, path.extname(srcPath));
        const outName = base + '.webp';
        const outPath = path.join(path.dirname(srcPath), outName);

        await sharp(srcPath)
            .rotate()
            .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(outPath);

        try { fs.unlinkSync(srcPath); } catch { /* ignore */ }

        req.file.filename = outName;
        req.file.path = outPath;
        req.file.mimetype = 'image/webp';
        req.file.processedUrl = '/assets/uploads/' + outName;
    } catch (err) {
        logger.error({ err }, 'sharp processing failed; using original');
        req.file.processedUrl = '/assets/uploads/' + req.file.filename;
    }
    next();
}

// Yerel olarak yüklenmiş bir görseli (/assets/uploads/<dosya>) diskten siler.
// Uzak URL'ler veya beklenmeyen yollar sessizce yoksayılır.
function removeUploadedFile(fileUrl) {
    try {
        if (!fileUrl || typeof fileUrl !== 'string') return;
        if (!fileUrl.startsWith('/assets/uploads/')) return;
        const name = path.basename(fileUrl);
        fs.unlinkSync(path.join(config.upload.uploadDir, name));
    } catch { /* dosya yok veya silinemiyor — yoksay */ }
}

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Dosya boyutu çok büyük. Maksimum 5MB.' });
        }
        return res.status(400).json({ error: 'Dosya yükleme hatası: ' + err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

module.exports = { uploadImage, processImage, handleUploadError, removeUploadedFile };
