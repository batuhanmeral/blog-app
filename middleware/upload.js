const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const config = require('../config');

const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

const SIZE_LIMITS = {
    image: 5 * 1024 * 1024,
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = config.upload.uploadDir;
        
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${timestamp}-${uniqueId}${ext}`;
        cb(null, safeName);
    }
});

const imageFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.image.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir (jpg, png, gif, webp)'), false);
    }
};

const uploadImage = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: SIZE_LIMITS.image
    }
});

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Dosya boyutu çok büyük. Maksimum 5MB yüklenebilir.' });
        }
        return res.status(400).json({ error: 'Dosya yükleme hatası: ' + err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

module.exports = {
    uploadImage,
    handleUploadError
};
