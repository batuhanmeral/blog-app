const Category = require('../../models/Category');
const Post = require('../../models/Post');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');

exports.getCategories = async (req, res) => {
    try {
        const showArchived = req.query.archived === '1';
        const filter = showArchived ? { archived: true } : { archived: { $ne: true } };
        const categories = await Category.find(filter).sort({ name: 1 }).lean();

        const counts = await Post.aggregate([
            { $unwind: '$categories' },
            { $group: { _id: '$categories', count: { $sum: 1 } } }
        ]);
        const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));

        res.render('admin/categories/list', {
            title: 'Kategoriler',
            categories: categories.map(c => ({ ...c, postCount: countMap[String(c._id)] || 0 })),
            showArchived
        });
    } catch (err) {
        logger.error({ err }, 'getCategories');
        res.status(500).send('Hata');
    }
};

exports.getAddCategoryPage = (req, res) => {
    res.render('admin/categories/add', { title: 'Yeni Kategori' });
};

exports.addCategory = async (req, res) => {
    try {
        const slug = Category.generateSlug(req.body.name);
        await Category.create({
            name: req.body.name,
            slug,
            color: req.body.color || '#10b981'
        });
        await AuditLog.log(req, 'CREATE_CATEGORY', { type: 'Category', title: req.body.name });
        res.redirect('/admin/categories');
    } catch (err) {
        logger.error({ err }, 'addCategory');
        if (err.code === 11000) {
            return res.status(400).send('Bu kategori zaten mevcut');
        }
        res.status(500).send('Hata');
    }
};

exports.getEditCategoryPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).lean();
        if (!category) return res.status(404).send('Kategori bulunamadı');
        res.render('admin/categories/edit', { title: 'Kategoriyi Düzenle', category });
    } catch (err) {
        logger.error({ err }, 'getEditCategoryPage');
        res.status(500).send('Hata');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Kategori bulunamadı');

        category.name = req.body.name;
        category.slug = Category.generateSlug(req.body.name);
        if (req.body.color) category.color = req.body.color;

        await category.save();
        await AuditLog.log(req, 'UPDATE_CATEGORY', { type: 'Category', id: category._id, title: category.name });
        res.redirect('/admin/categories');
    } catch (err) {
        logger.error({ err }, 'updateCategory');
        res.status(500).send('Güncelleme Hatası');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Kategori bulunamadı');

        const postCount = await Post.countDocuments({ categories: req.params.id });
        if (postCount > 0) {
            category.archived = true;
            category.archivedAt = new Date();
            await category.save();
            await AuditLog.log(req, 'DELETE_CATEGORY', {
                type: 'Category', id: category._id,
                title: `Archived ${category.name} (${postCount} yazı korundu)`
            });
            req.flash('success', `${postCount} yazı bağlı olduğundan kategori arşivlendi.`);
        } else {
            await category.deleteOne();
            await AuditLog.log(req, 'DELETE_CATEGORY', { type: 'Category', id: category._id, title: category.name });
            req.flash('success', 'Kategori silindi.');
        }

        res.redirect('/admin/categories');
    } catch (err) {
        logger.error({ err }, 'deleteCategory');
        res.status(500).send('Silme Hatası');
    }
};

exports.restoreCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Kategori bulunamadı');
        category.archived = false;
        category.archivedAt = null;
        await category.save();
        await AuditLog.log(req, 'UPDATE_CATEGORY', { type: 'Category', id: category._id, title: 'Restored ' + category.name });
        req.flash('success', 'Kategori geri yüklendi.');
        res.redirect('/admin/categories?archived=1');
    } catch (err) {
        logger.error({ err }, 'restoreCategory');
        res.status(500).send('Hata');
    }
};
