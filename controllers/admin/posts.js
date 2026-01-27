const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const Visit = require('../../models/Visit');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');
const { sanitizePostMarkdown, sanitizeImageUrl } = require('../../utils/sanitize');
const { canMutate } = require('../../middleware/authorize');
const { removeUploadedFile } = require('../../middleware/upload');

function denyOwnership(res) {
    return res.status(403).render('errors/403', {
        title: 'Yetkisiz',
        message: 'Bu yazı üzerinde işlem yapma yetkiniz yok.'
    });
}

const ALLOWED_STATUS = ['draft', 'published'];

function pickStatus(value) {
    return ALLOWED_STATUS.includes(value) ? value : 'published';
}

function normalizeCategories(value) {
    if (!value) return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.filter(id => /^[a-f0-9]{24}$/i.test(String(id)));
}

// "nodejs, Güvenlik" → ['nodejs', 'güvenlik']; trim+lowercase, tekille, sınırla
function normalizeTags(value) {
    if (!value) return [];
    const raw = Array.isArray(value) ? value : String(value).split(',');
    const seen = new Set();
    const out = [];
    for (let t of raw) {
        t = String(t).trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 30);
        if (t && !seen.has(t)) { seen.add(t); out.push(t); }
        if (out.length >= 15) break;
    }
    return out;
}

exports.getPosts = async (req, res) => {
    try {
        const query = {};
        if (req.query.status && ALLOWED_STATUS.includes(req.query.status)) {
            query.status = req.query.status;
        }
        if (req.query.category && /^[a-f0-9]{24}$/i.test(req.query.category)) {
            query.categories = req.query.category;
        }
        // author yalnızca kendi yazılarını listeler
        if (req.session.user.role === 'author') {
            query.author = req.session.user.id;
        }

        const [posts, categories] = await Promise.all([
            Post.find(query).populate('categories', 'name color').sort({ createdAt: -1 }).lean(),
            Category.find({ archived: { $ne: true } }).sort({ name: 1 }).lean()
        ]);

        res.render('admin/posts/list', {
            title: 'Yazılar',
            posts,
            categories,
            user: req.session.user
        });
    } catch (err) {
        logger.error({ err }, 'getPosts');
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getAddPostPage = async (req, res) => {
    try {
        const categories = await Category.find({ archived: { $ne: true } }).sort({ name: 1 }).lean();
        res.render('admin/posts/add', { title: 'Yeni Yazı', categories });
    } catch (err) {
        logger.error({ err }, 'getAddPostPage');
        res.status(500).send('Hata');
    }
};

exports.addPost = async (req, res) => {
    try {
        const title = req.body.title.trim();
        const content = sanitizePostMarkdown(req.body.content);

        let imagePath;
        if (req.file) {
            imagePath = req.file.processedUrl || ('/assets/uploads/' + req.file.filename);
        } else {
            imagePath = sanitizeImageUrl(req.body.image);
        }

        const readTime = Post.calculateReadTime(content);
        const slug = Post.generateSlug(title) + '-' + Date.now();

        const post = await Post.create({
            title,
            slug,
            content,
            image: imagePath,
            imageAlt: (req.body.imageAlt || '').trim(),
            summary: (req.body.summary || '').trim() || null,
            seoTitle: (req.body.seoTitle || '').trim() || null,
            seoDescription: (req.body.seoDescription || '').trim() || null,
            seoKeywords: (req.body.seoKeywords || '').trim() || null,
            ogImage: sanitizeImageUrl(req.body.ogImage),
            readTime,
            categories: normalizeCategories(req.body.categories),
            tags: normalizeTags(req.body.tags),
            status: pickStatus(req.body.status),
            author: req.session.user.id
        });

        await AuditLog.log(req, 'CREATE_POST', { type: 'Post', id: post._id, title: post.title });
        res.redirect('/admin/posts');
    } catch (err) {
        logger.error({ err }, 'addPost');
        res.status(500).send('Kayıt Hatası');
    }
};

exports.getEditPostPage = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('categories').lean();
        if (!post) return res.status(404).send('Yazı bulunamadı');
        if (!canMutate(post.author, req.session.user)) return denyOwnership(res);

        const categories = await Category.find({ archived: { $ne: true } }).sort({ name: 1 }).lean();
        const postCategoryIds = (post.categories || []).map(c => c._id.toString());

        res.render('admin/posts/edit', { title: 'Yazıyı Düzenle', post, categories, postCategoryIds });
    } catch (err) {
        logger.error({ err }, 'getEditPostPage');
        res.status(500).send('Hata');
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Yazı bulunamadı');
        if (!canMutate(post.author, req.session.user)) return denyOwnership(res);

        const title = req.body.title.trim();
        const content = sanitizePostMarkdown(req.body.content);
        const readTime = Post.calculateReadTime(content);

        const updateData = {
            title,
            content,
            imageAlt: (req.body.imageAlt || '').trim(),
            summary: (req.body.summary || '').trim() || null,
            seoTitle: (req.body.seoTitle || '').trim() || null,
            seoDescription: (req.body.seoDescription || '').trim() || null,
            seoKeywords: (req.body.seoKeywords || '').trim() || null,
            ogImage: sanitizeImageUrl(req.body.ogImage),
            readTime,
            categories: normalizeCategories(req.body.categories),
            tags: normalizeTags(req.body.tags),
            status: pickStatus(req.body.status)
        };

        if (req.file) {
            updateData.image = req.file.processedUrl || ('/assets/uploads/' + req.file.filename);
            // yeni görsel geldiyse eski yerel görseli diskten temizle
            if (post.image && post.image !== updateData.image) removeUploadedFile(post.image);
        } else if (req.body.image) {
            const safe = sanitizeImageUrl(req.body.image);
            if (safe) updateData.image = safe;
        }

        await Post.findByIdAndUpdate(req.params.id, updateData);
        await AuditLog.log(req, 'UPDATE_POST', { type: 'Post', id: post._id, title: post.title });
        res.redirect('/admin/posts');
    } catch (err) {
        logger.error({ err }, 'updatePost');
        res.status(500).send('Güncelleme Hatası');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Yazı bulunamadı');
        if (!canMutate(post.author, req.session.user)) return denyOwnership(res);

        await Post.findByIdAndDelete(req.params.id);
        // Bağımlı kayıtları temizle (yorumlar + ziyaret istatistikleri yetim kalmasın)
        await Promise.all([
            Comment.deleteMany({ post: post._id }),
            Visit.deleteMany({ postId: post._id })
        ]);
        removeUploadedFile(post.image);
        await AuditLog.log(req, 'DELETE_POST', { type: 'Post', id: post._id, title: post.title });
        res.redirect('/admin/posts');
    } catch (err) {
        logger.error({ err }, 'deletePost');
        res.status(500).send('Silme Hatası');
    }
};

exports.bulkPosts = async (req, res) => {
    try {
        const ids = req.body.ids;
        const action = req.body.action;

        // author yalnızca kendi yazıları üzerinde toplu işlem yapabilir
        const scope = { _id: { $in: ids } };
        if (req.session.user.role === 'author') scope.author = req.session.user.id;

        let affected = 0;
        if (action === 'delete') {
            const toDelete = await Post.find(scope).select('_id image').lean();
            const delIds = toDelete.map(p => p._id);
            const result = await Post.deleteMany(scope);
            affected = result.deletedCount || 0;
            // Bağımlı kayıtları temizle (yorumlar + ziyaret istatistikleri yetim kalmasın)
            await Promise.all([
                Comment.deleteMany({ post: { $in: delIds } }),
                Visit.deleteMany({ postId: { $in: delIds } })
            ]);
            toDelete.forEach(p => removeUploadedFile(p.image));
            await AuditLog.log(req, 'DELETE_POST', { type: 'Post', title: `Bulk ${affected} silindi` });
        } else if (action === 'publish') {
            const result = await Post.updateMany(scope, { status: 'published' });
            affected = result.modifiedCount || 0;
            await AuditLog.log(req, 'UPDATE_POST', { type: 'Post', title: `Bulk ${affected} yayına alındı` });
        } else if (action === 'draft') {
            const result = await Post.updateMany(scope, { status: 'draft' });
            affected = result.modifiedCount || 0;
            await AuditLog.log(req, 'UPDATE_POST', { type: 'Post', title: `Bulk ${affected} taslağa alındı` });
        }

        req.flash('success', `${affected} yazı için işlem tamamlandı.`);
        res.redirect('/admin/posts');
    } catch (err) {
        logger.error({ err }, 'bulkPosts');
        res.status(500).send('Hata');
    }
};

exports.uploadImage = (req, res) => {
    if (req.file) {
        const url = req.file.processedUrl || ('/assets/uploads/' + req.file.filename);
        res.json({ location: url });
    } else {
        res.status(400).json({ error: 'Dosya yüklenemedi' });
    }
};
