const Post = require('../../models/Post');
const User = require('../../models/User');
const Contact = require('../../models/Contact');
const Category = require('../../models/Category');

exports.getHomePage = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'published' },
            include: [User, Category],
            order: [['date', 'DESC']],
            limit: 3
        });
        
        const categories = await Category.findAll({ limit: 10 });
        
        res.render('web/home', {
            title: 'Ana Sayfa',
            posts: posts,
            categories: categories
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getAboutPage = (req, res) => {
    res.render('web/static/about', {
        title: 'Hakkımda'
    });
};

exports.getBlogPage = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        
        let posts;
        let activeCategory = null;
        
        if (req.query.category) {
            activeCategory = await Category.findOne({
                where: { slug: req.query.category },
                include: [{
                    model: Post,
                    where: { status: 'published' },
                    include: [User, Category],
                    required: false
                }]
            });
            posts = activeCategory ? activeCategory.Posts : [];
        } else {
            posts = await Post.findAll({
                where: { status: 'published' },
                include: [User, Category],
                order: [['date', 'DESC']]
            });
        }

        res.render('web/blog/index', {
            title: activeCategory ? `${activeCategory.name} Yazıları` : 'Makaleler',
            posts: posts,
            categories: categories,
            activeCategory: activeCategory
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getContactPage = (req, res) => {
    res.render('web/static/contact', {
        title: 'İletişim'
    });
};

exports.sendContactMessage = async (req, res) => {
    try {
        await Contact.create({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        });
        res.redirect('/contact?success=true');
    } catch (err) {
        console.log(err);
        res.status(500).send('Mesaj gönderilemedi');
    }
};
