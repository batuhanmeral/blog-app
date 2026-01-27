const crypto = require('crypto');
const { marked } = require('marked');
const Post = require('../../models/Post');
const Visit = require('../../models/Visit');
const Comment = require('../../models/Comment');
const logger = require('../../utils/logger');
const { sanitizePostHtml } = require('../../utils/sanitize');

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function ipHash(req) {
    return crypto.createHash('sha256').update(String(req.ip || '')).digest('hex').slice(0, 16);
}

async function recordVisit(postId, req) {
    try {
        const day = todayKey();
        const hash = ipHash(req);
        // Atomik upsert: yalnızca yeni kayıt eklenirse görüntülenme artar.
        // Eşzamanlı isteklerde unique index sayesinde yalnızca biri insert eder.
        const result = await Visit.updateOne(
            { postId, day, ipHash: hash },
            { $setOnInsert: { postId, day, ipHash: hash, createdAt: new Date() } },
            { upsert: true }
        );
        if (result.upsertedCount > 0) {
            await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
        }
    } catch (err) {
        // 11000 = duplicate key (race) → yeni ziyaret değil, sessizce geç
        if (!err || err.code !== 11000) logger.warn({ err }, 'visit recording failed');
    }
}

exports.getPostDetail = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('categories');
        if (!post || post.status !== 'published') {
            return res.status(404).render('errors/404');
        }

        recordVisit(post._id, req);

        const rawHtml = marked(post.content);
        const content = sanitizePostHtml(rawHtml);

        const categoryIds = (post.categories || []).map(c => c._id);
        const tags = post.tags || [];
        const or = [];
        if (categoryIds.length) or.push({ categories: { $in: categoryIds } });
        if (tags.length) or.push({ tags: { $in: tags } });

        let related = or.length
            ? await Post.find({ _id: { $ne: post._id }, status: 'published', $or: or })
                .sort({ createdAt: -1 }).limit(3).lean()
            : [];

        // 3'ten az ilgili varsa son yazılarla tamamla
        if (related.length < 3) {
            const exclude = [post._id, ...related.map(r => r._id)];
            const fill = await Post.find({ _id: { $nin: exclude }, status: 'published' })
                .sort({ createdAt: -1 }).limit(3 - related.length).lean();
            related = related.concat(fill);
        }

        const comments = await Comment.find({ post: post._id, status: 'approved' })
            .sort({ createdAt: 1 }).lean();

        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
        const canonical = `${siteUrl}/blog/${post._id}`;

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.seoDescription || post.summary,
            image: post.ogImage || post.image,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            author: { '@type': 'Person', name: 'Batuhan Meral' }
        };

        return res.render('web/blog/detail', {
            title: post.seoTitle || post.title,
            seoTitle: post.seoTitle || post.title,
            seoDescription: post.seoDescription || post.summary,
            seoKeywords: post.seoKeywords,
            ogImage: post.ogImage || post.image,
            ogType: 'article',
            ogUrl: canonical,
            canonicalUrl: canonical,
            post,
            content,
            related,
            comments,
            jsonLd: JSON.stringify(jsonLd)
        });
    } catch (err) {
        logger.error({ err }, 'getPostDetail');
        res.status(500).send('Sunucu Hatası');
    }
};

exports.submitComment = async (req, res) => {
    const backTo = `/blog/${req.params.id}#yorumlar`;
    try {
        const post = await Post.findById(req.params.id).select('_id status').lean();
        if (!post || post.status !== 'published') {
            return res.status(404).render('errors/404');
        }

        // honeypot: doluysa sessizce başarı döndür, kaydetme
        if (req.body.website) {
            req.flash('success', req.t('comments.success'));
            return res.redirect(backTo);
        }

        await Comment.create({
            post: post._id,
            name: req.body.name,
            email: req.body.email || '',
            body: req.body.body,
            ipHash: ipHash(req),
            userAgent: (req.get('user-agent') || '').slice(0, 500)
        });

        req.flash('success', req.t('comments.success'));
        res.redirect(backTo);
    } catch (err) {
        logger.error({ err }, 'submitComment');
        if (err && err.name === 'ValidationError') {
            req.flash('error', req.t('comments.error'));
            return res.redirect(backTo);
        }
        res.status(500).send('Yorum gönderilemedi');
    }
};
