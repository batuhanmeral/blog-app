const Post = require('../../models/Post');
const User = require('../../models/User');
const Category = require('../../models/Category');
const AuditLog = require('../../models/AuditLog');

exports.getPosts = async (req, res) => {
    try {
        let whereClause = {};
        if (req.session.user.role !== 'admin') {
            whereClause = { userId: req.session.user.id };
        }
        
        if (req.query.status) {
            whereClause.status = req.query.status;
        }
        
        const posts = await Post.findAll({
            where: whereClause,
            include: [User, Category],
            order: [['date', 'DESC']]
        });
        res.render('admin/posts/list', { title: 'Makaleler', posts, user: req.session.user });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getAddPostPage = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.render('admin/posts/add', { title: 'Yeni Yazı Ekle', categories });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.addPost = async (req, res) => {
    try {
        let imagePath = req.body.image;
        if (req.file) {
            imagePath = '/assets/uploads/' + req.file.filename;
        }

        const status = req.session.user.role === 'admin' ? 'published' : 'pending';
        
        const readTime = Post.calculateReadTime(req.body.content);
        
        const slug = Post.generateSlug(req.body.title) + '-' + Date.now();

        const post = await Post.create({
            title: req.body.title,
            slug: slug,
            content: req.body.content,
            image: imagePath,
            summary: req.body.summary,
            seoTitle: req.body.seoTitle || null,
            seoDescription: req.body.seoDescription || null,
            seoKeywords: req.body.seoKeywords || null,
            ogImage: req.body.ogImage || null,
            readTime: readTime,
            userId: req.session.user.id,
            status: status
        });
        
        if (req.body.categories) {
            const categoryIds = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];
            const categories = await Category.findAll({ where: { id: categoryIds } });
            await post.setCategories(categories);
        }
        
        await AuditLog.log(req, 'CREATE_POST', {
            type: 'Post',
            id: post.id,
            title: post.title
        });
        
        res.redirect('/admin/posts');
    } catch (err) {
        console.log(err);
        res.status(500).send('Kayıt Hatası');
    }
};

exports.getEditPostPage = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, { include: Category });
        if (!post) {
            return res.status(404).send('Yazı bulunamadı');
        }
        if (req.session.user.role !== 'admin' && post.userId !== req.session.user.id) {
            return res.status(403).send('Yetersiz yetki');
        }
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        const postCategoryIds = post.Categories ? post.Categories.map(c => c.id) : [];
        res.render('admin/posts/edit', { title: 'Yazıyı Düzenle', post, categories, postCategoryIds });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Yazı bulunamadı');
        }
        const isOwner = post.userId === req.session.user.id;
        const isAdmin = req.session.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).send('Yetersiz yetki: Bu yazıyı düzenleme hakkınız yok.');
        }
        
        const readTime = Post.calculateReadTime(req.body.content);

        const updateData = {
            title: req.body.title,
            content: req.body.content,
            summary: req.body.summary,
            seoTitle: req.body.seoTitle || null,
            seoDescription: req.body.seoDescription || null,
            seoKeywords: req.body.seoKeywords || null,
            ogImage: req.body.ogImage || null,
            readTime: readTime,
            date: Date.now()
        };

        if (req.file) {
            updateData.image = '/assets/uploads/' + req.file.filename;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        await Post.update(updateData, { where: { id: req.params.id } });
        
        const updatedPost = await Post.findByPk(req.params.id);
        if (req.body.categories) {
            const categoryIds = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];
            const categories = await Category.findAll({ where: { id: categoryIds } });
            await updatedPost.setCategories(categories);
        } else {
            await updatedPost.setCategories([]);
        }
        
        await AuditLog.log(req, 'UPDATE_POST', {
            type: 'Post',
            id: post.id,
            title: post.title
        });
        
        res.redirect('/admin/posts');
    } catch (err) {
        console.log(err);
        res.status(500).send('Güncelleme Hatası');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Yazı bulunamadı');
        }
        const isOwner = post.userId === req.session.user.id;
        const isAdmin = req.session.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).send('Yetersiz yetki: Bu yazıyı silme hakkınız yok.');
        }

        const postTitle = post.title;
        const postId = post.id;
        
        await Post.destroy({ where: { id: req.params.id } });
        
        await AuditLog.log(req, 'DELETE_POST', {
            type: 'Post',
            id: postId,
            title: postTitle
        });
        
        res.redirect('/admin/posts');
    } catch (err) {
        console.log(err);
        res.status(500).send('Silme Hatası');
    }
};

exports.uploadImage = (req, res) => {
    if (req.file) {
        res.json({ location: '/assets/uploads/' + req.file.filename });
    } else {
        res.status(400).json({ error: 'Dosya yüklenemedi' });
    }
};

exports.approvePost = async (req, res) => {
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).send('Yetersiz yetki');
        }
        await Post.update({ status: 'published' }, { where: { id: req.params.id } });
        res.redirect('/admin/posts?status=pending');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.rejectPost = async (req, res) => {
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).send('Yetersiz yetki');
        }
        await Post.update({ status: 'rejected' }, { where: { id: req.params.id } });
        res.redirect('/admin/posts?status=pending');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};
