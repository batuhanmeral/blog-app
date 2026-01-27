const Category = require('../../models/Category');
const Post = require('../../models/Post');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.render('admin/categories/list', { title: 'Kategoriler', categories });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.getAddCategoryPage = (req, res) => {
    res.render('admin/categories/add', { title: 'Yeni Kategori Ekle' });
};

exports.addCategory = async (req, res) => {
    try {
        const slug = Category.generateSlug(req.body.name);
        
        await Category.create({
            name: req.body.name,
            slug: slug,
            color: req.body.color || '#10b981'
        });
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).send('Bu kategori zaten mevcut');
        } else {
            res.status(500).send('Hata');
        }
    }
};

exports.getEditCategoryPage = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).send('Kategori bulunamadı');
        }
        res.render('admin/categories/edit', { title: 'Kategoriyi Düzenle', category });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).send('Kategori bulunamadı');
        }
        
        const slug = Category.generateSlug(req.body.name);
        
        await Category.update({
            name: req.body.name,
            slug: slug,
            color: req.body.color
        }, { where: { id: req.params.id } });
        
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        res.status(500).send('Güncelleme Hatası');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [{ model: Post }]
        });
        
        if (!category) {
            return res.status(404).send('Kategori bulunamadı');
        }
        
        if (category.Posts && category.Posts.length > 0) {
            return res.status(400).send(`Bu kategori ${category.Posts.length} yazıya bağlı. Önce yazıları başka bir kategoriye taşıyın veya silin.`);
        }
        
        await Category.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        res.status(500).send('Silme Hatası');
    }
};
