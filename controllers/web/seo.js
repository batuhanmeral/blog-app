const RSS = require('rss');
const Post = require('../../models/Post');
const config = require('../../config');
const logger = require('../../utils/logger');

function siteUrl(req) {
    return process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
}

exports.getRss = async (req, res) => {
    try {
        const url = siteUrl(req);
        const feed = new RSS({
            title: config.app.name,
            description: config.app.description,
            site_url: url,
            feed_url: `${url}/rss.xml`,
            language: 'tr',
            pubDate: new Date()
        });

        const posts = await Post.find({ status: 'published' })
            .sort({ createdAt: -1 }).limit(50).lean();

        for (const p of posts) {
            feed.item({
                title: p.title,
                description: p.summary || '',
                url: `${url}/blog/${p._id}`,
                guid: String(p._id),
                date: p.createdAt
            });
        }

        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.send(feed.xml({ indent: true }));
    } catch (err) {
        logger.error({ err }, 'getRss');
        res.status(500).send('RSS hatası');
    }
};

exports.getSitemap = async (req, res) => {
    try {
        const url = siteUrl(req);
        const posts = await Post.find({ status: 'published' })
            .select('_id updatedAt').sort({ createdAt: -1 }).lean();

        const staticUrls = ['/', '/blog', '/about', '/contact'];
        const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
        }[c]));

        const items = [
            ...staticUrls.map(p => `<url><loc>${xmlEscape(url + p)}</loc></url>`),
            ...posts.map(p =>
                `<url><loc>${xmlEscape(`${url}/blog/${p._id}`)}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`
            )
        ];

        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</urlset>`);
    } catch (err) {
        logger.error({ err }, 'getSitemap');
        res.status(500).send('Sitemap hatası');
    }
};

exports.getRobots = (req, res) => {
    const url = siteUrl(req);
    res.type('text/plain');
    res.send(`User-agent: *\nDisallow: /admin/\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);
};
