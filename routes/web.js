const express = require('express');
const router = express.Router();
const homeController = require('../controllers/web/home');
const blogController = require('../controllers/web/blog');
const seoController = require('../controllers/web/seo');
const { verifyToken: verifyCsrf } = require('../middleware/csrf');
const { commentLimiter } = require('../middleware/security');
const v = require('../middleware/validators');

router.get('/', homeController.getHomePage);
router.get('/about', homeController.getAboutPage);
router.get('/contact', homeController.getContactPage);
router.post('/contact', verifyCsrf, v.validate(v.contact), homeController.sendContactMessage);

router.get('/blog', homeController.getBlogPage);
router.get('/blog/:id', v.validate([v.objectIdParam('id')]), blogController.getPostDetail);
router.post('/blog/:id/comments', commentLimiter, verifyCsrf, v.validate([v.objectIdParam('id'), ...v.comment]), blogController.submitComment);

// Kategori ve etiket sayfaları blog listesini (arama/kategori/etiket) yeniden kullanır
router.get('/category/:slug', (req, res, next) => { req.query.category = req.params.slug; homeController.getBlogPage(req, res, next); });
router.get('/tag/:tag', (req, res, next) => { req.query.tag = req.params.tag; homeController.getBlogPage(req, res, next); });

router.get('/rss.xml', seoController.getRss);
router.get('/sitemap.xml', seoController.getSitemap);
router.get('/robots.txt', seoController.getRobots);

module.exports = router;
