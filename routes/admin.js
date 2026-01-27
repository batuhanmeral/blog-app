const express = require('express');
const router = express.Router();
const config = require('../config');

const { isAuthenticated, isGuest, enforcePasswordChange } = require('../middleware/auth');
const { uploadImage, processImage, handleUploadError } = require('../middleware/upload');
const { loginLimiter } = require('../middleware/security');
const { verifyToken: verifyCsrf } = require('../middleware/csrf');
const { verifyFingerprint } = require('../middleware/sessionFingerprint');
const { isAdmin, isEditor, isAuthor } = require('../middleware/authorize');
const v = require('../middleware/validators');

const authController = require('../controllers/admin/auth');
const dashboardController = require('../controllers/admin/dashboard');
const postController = require('../controllers/admin/posts');
const userController = require('../controllers/admin/users');
const messageController = require('../controllers/admin/messages');
const categoryController = require('../controllers/admin/categories');
const auditController = require('../controllers/admin/audit');
const mediaController = require('../controllers/admin/media');
const commentController = require('../controllers/admin/comments');

router.use(verifyFingerprint);
router.use(enforcePasswordChange);

const loginPath = config.admin.loginPath || 'login';
router.get(`/${loginPath}`, isGuest, authController.getLoginPage);
router.post(`/${loginPath}`, isGuest, loginLimiter, verifyCsrf, v.validate(v.login), authController.login);

router.post('/logout', isAuthenticated, verifyCsrf, authController.logout);

router.get('/', isAuthenticated, (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

// Posts
router.get('/posts', isAuthenticated, isAuthor, postController.getPosts);
router.get('/posts/add', isAuthenticated, isAuthor, postController.getAddPostPage);
router.post('/posts/add', isAuthenticated, isAuthor, uploadImage.single('image'), handleUploadError, processImage, verifyCsrf, v.validate(v.postCreate), postController.addPost);
router.get('/posts/edit/:id', isAuthenticated, isAuthor, v.validate([v.objectIdParam('id')]), postController.getEditPostPage);
router.post('/posts/edit/:id', isAuthenticated, isAuthor, uploadImage.single('image'), handleUploadError, processImage, verifyCsrf, v.validate([v.objectIdParam('id'), ...v.postCreate]), postController.updatePost);
router.post('/posts/delete/:id', isAuthenticated, isAuthor, verifyCsrf, v.validate([v.objectIdParam('id')]), postController.deletePost);
router.post('/posts/bulk', isAuthenticated, isAuthor, verifyCsrf, v.validate(v.bulkPosts), postController.bulkPosts);

// AJAX upload: CSRF token header'da geldiği için multer'dan ÖNCE doğrulanır
// (geçersiz istekte dosya diske yazılmadan reddedilir).
router.post('/upload-image', isAuthenticated, isAuthor, verifyCsrf, uploadImage.single('file'), handleUploadError, processImage, postController.uploadImage);

// Profile
router.get('/profile', isAuthenticated, userController.getProfilePage);
router.post('/profile', isAuthenticated, verifyCsrf, v.validate(v.profile), userController.updateProfile);
router.post('/profile/delete', isAuthenticated, verifyCsrf, userController.deleteProfile);

// 2FA
router.get('/2fa', isAuthenticated, authController.getTotpSetup);
router.post('/2fa/enable', isAuthenticated, verifyCsrf, v.validate(v.totpVerify), authController.enableTotp);
router.post('/2fa/disable', isAuthenticated, verifyCsrf, authController.disableTotp);
router.post('/2fa/backup-codes', isAuthenticated, verifyCsrf, authController.regenerateBackupCodes);

// Users (admin only)
router.get('/users', isAuthenticated, isAdmin, userController.listUsers);
router.get('/users/add', isAuthenticated, isAdmin, userController.getAddUserPage);
router.post('/users/add', isAuthenticated, isAdmin, verifyCsrf, v.validate(v.userCreate), userController.createUser);
router.get('/users/edit/:id', isAuthenticated, isAdmin, v.validate([v.objectIdParam('id')]), userController.getEditUserPage);
router.post('/users/edit/:id', isAuthenticated, isAdmin, verifyCsrf, v.validate([v.objectIdParam('id'), ...v.userUpdate]), userController.updateUser);
router.post('/users/delete/:id', isAuthenticated, isAdmin, verifyCsrf, v.validate([v.objectIdParam('id')]), userController.deleteUser);

// Messages (editor+; author iletişim kutusunu görmez)
router.get('/messages', isAuthenticated, isEditor, messageController.getMessages);
router.post('/messages/delete/:id', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id')]), messageController.deleteMessage);
router.post('/messages/:id/read', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id')]), messageController.markAsRead);

// Categories
router.get('/categories', isAuthenticated, categoryController.getCategories);
router.get('/categories/add', isAuthenticated, isEditor, categoryController.getAddCategoryPage);
router.post('/categories/add', isAuthenticated, isEditor, verifyCsrf, v.validate(v.category), categoryController.addCategory);
router.get('/categories/edit/:id', isAuthenticated, isEditor, v.validate([v.objectIdParam('id')]), categoryController.getEditCategoryPage);
router.post('/categories/edit/:id', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id'), ...v.category]), categoryController.updateCategory);
router.post('/categories/delete/:id', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id')]), categoryController.deleteCategory);
router.post('/categories/restore/:id', isAuthenticated, isAdmin, verifyCsrf, v.validate([v.objectIdParam('id')]), categoryController.restoreCategory);

// Media
router.get('/media', isAuthenticated, isAuthor, mediaController.getMedia);
router.post('/media/upload', isAuthenticated, isAuthor, verifyCsrf, uploadImage.single('file'), handleUploadError, processImage, mediaController.uploadMedia);
router.post('/media/delete/:id', isAuthenticated, isAuthor, verifyCsrf, v.validate([v.objectIdParam('id')]), mediaController.deleteMedia);
router.get('/api/media', isAuthenticated, isAuthor, mediaController.getMediaApi);

// Comments (editor+ moderation)
router.get('/comments', isAuthenticated, isEditor, commentController.getComments);
router.post('/comments/:id/approve', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id')]), commentController.approveComment);
router.post('/comments/:id/spam', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id')]), commentController.spamComment);
router.post('/comments/delete/:id', isAuthenticated, isEditor, verifyCsrf, v.validate([v.objectIdParam('id')]), commentController.deleteComment);

// Audit (admin only)
router.get('/audit', isAuthenticated, isAdmin, auditController.getAuditLogs);
router.get('/audit/export/:format', isAuthenticated, isAdmin, auditController.exportLogs);
router.post('/audit/clear-all', isAuthenticated, isAdmin, verifyCsrf, auditController.clearAllLogs);

module.exports = router;
