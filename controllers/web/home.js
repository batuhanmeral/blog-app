const Post = require('../../models/Post');
const Contact = require('../../models/Contact');
const Category = require('../../models/Category');
const logger = require('../../utils/logger');

exports.getHomePage = async (req, res) => {
    try {
        const [posts, categories] = await Promise.all([
            Post.find({ status: 'published' })
                .populate('categories', 'name color slug')
                .sort({ createdAt: -1 })
                .limit(3)
                .lean(),
            Category.find({ archived: { $ne: true } }).limit(10).lean()
        ]);

        res.render('web/home', { title: 'Ana Sayfa', posts, categories });
    } catch (err) {
        logger.error({ err }, 'getHomePage');
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getAboutPage = (req, res) => {
    res.render('web/static/about', { title: 'Hakkımda' });
};

exports.getBlogPage = async (req, res) => {
    try {
        const categories = await Category.find({ archived: { $ne: true } }).sort({ name: 1 }).lean();
        const base = { status: 'published' };

        const q = String(req.query.q || '').trim().slice(0, 100);
        const tag = String(req.query.tag || '').trim().toLowerCase().slice(0, 30);

        let posts = [], activeCategory = null, activeTag = null, searchQuery = '';

        if (q) {
            searchQuery = q;
            posts = await Post.find(
                { ...base, $text: { $search: q } },
                { score: { $meta: 'textScore' } }
            ).populate('categories', 'name color slug')
                .sort({ score: { $meta: 'textScore' } })
                .limit(50).lean();
        } else if (tag) {
            activeTag = tag;
            posts = await Post.find({ ...base, tags: tag })
                .populate('categories', 'name color slug')
                .sort({ createdAt: -1 }).lean();
        } else if (req.query.category) {
            activeCategory = await Category.findOne({ slug: String(req.query.category) }).lean();
            posts = activeCategory
                ? await Post.find({ ...base, categories: activeCategory._id })
                    .populate('categories', 'name color slug').sort({ createdAt: -1 }).lean()
                : [];
        } else {
            posts = await Post.find(base)
                .populate('categories', 'name color slug')
                .sort({ createdAt: -1 }).lean();
        }

        let title = 'Yazılar';
        if (searchQuery) title = `"${searchQuery}" için arama sonuçları`;
        else if (activeTag) title = `#${activeTag} etiketli yazılar`;
        else if (activeCategory) title = `${activeCategory.name} Yazıları`;

        res.render('web/blog/index', {
            title, posts, categories, activeCategory, activeTag, searchQuery
        });
    } catch (err) {
        logger.error({ err }, 'getBlogPage');
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getContactPage = (req, res) => {
    res.render('web/static/contact', { title: 'İletişim' });
};

exports.sendContactMessage = async (req, res) => {
    try {
        if (req.body.website) {
            req.flash('success', req.t('contact.success'));
            return res.redirect('/contact');
        }

        await Contact.create({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        });

        req.flash('success', req.t('contact.success'));
        res.redirect('/contact');
    } catch (err) {
        logger.error({ err }, 'sendContactMessage');
        if (err && err.name === 'ValidationError') {
            req.flash('error', req.t('contact.error'));
            return res.redirect('/contact');
        }
        res.status(500).send('Mesaj gönderilemedi');
    }
};
