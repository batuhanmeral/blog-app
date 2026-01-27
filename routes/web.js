const express = require('express');
const router = express.Router();
const homeController = require('../controllers/web/home');
const blogController = require('../controllers/web/blog');

router.get('/', homeController.getHomePage);
router.get('/about', homeController.getAboutPage);
router.get('/contact', homeController.getContactPage);
router.post('/contact', homeController.sendContactMessage);

router.get('/blog', homeController.getBlogPage);
router.get('/blog/:id', blogController.getPostDetail);
router.post('/blog/:id/comment', blogController.addComment);

router.get('/category/:slug', blogController.getPostsByCategory);

module.exports = router;
