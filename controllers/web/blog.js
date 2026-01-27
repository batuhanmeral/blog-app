const Post = require('../../models/Post');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

exports.getPostDetail = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: [
                { model: User },
                { model: Comment, where: { status: 'approved' }, required: false, order: [['date', 'DESC']] },
                { model: Category }
            ]
        });

        const isAdmin = req.session.user && req.session.user.role === 'admin';

        if (!post || (post.status !== 'published' && !isAdmin)) {
            return res.status(404).send('Sayfa Bulunamadı');
        }

        if (post.status === 'published') {
            await Post.update(
                { viewCount: post.viewCount + 1 },
                { where: { id: post.id } }
            );
        }

        const rawHtml = marked(post.content);
        const sanitizedContent = sanitizeHtml(rawHtml, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'blockquote', 'code', 'pre']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt', 'class', 'style'],
                'a': ['href', 'target', 'rel']
            }
        });

        res.render('web/blog/detail', {
            title: post.seoTitle || post.title,
            seoTitle: post.seoTitle || post.title,
            seoDescription: post.seoDescription || post.summary,
            seoKeywords: post.seoKeywords,
            ogImage: post.ogImage || post.image,
            ogType: 'article',
            ogUrl: `${req.protocol}://${req.get('host')}/blog/${post.id}`,
            canonicalUrl: `${req.protocol}://${req.get('host')}/blog/${post.id}`,
            post: post,
            content: sanitizedContent
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};

exports.addComment = async (req, res) => {
    try {
        await Comment.create({
            name: req.body.name,
            email: req.body.email,
            content: req.body.content,
            postId: req.params.id,
            status: 'pending'
        });
        res.redirect('/blog/' + req.params.id + '?comment=pending#comments');
    } catch (err) {
        console.log(err);
        res.status(500).send('Yorum yapılamadı');
    }
};

exports.getPostsByCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ 
            where: { slug: req.params.slug },
            include: [{
                model: Post,
                where: { status: 'published' },
                include: [User],
                required: false
            }]
        });

        if (!category) {
            return res.status(404).send('Kategori bulunamadı');
        }

        res.render('web/blog/index', {
            title: `${category.name} Yazıları`,
            posts: category.Posts || [],
            activeCategory: category
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};
