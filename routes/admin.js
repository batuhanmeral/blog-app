const express = require('express');
const router = express.Router();

const { isAuthenticated, isAdmin, isGuest } = require('../middleware/auth');
const { uploadImage, handleUploadError } = require('../middleware/upload');
const { loginLimiter } = require('../middleware/security');

const authController = require('../controllers/admin/auth');
const dashboardController = require('../controllers/admin/dashboard');
const postController = require('../controllers/admin/posts');
const userController = require('../controllers/admin/users');
const messageController = require('../controllers/admin/messages');
const categoryController = require('../controllers/admin/categories');
const commentController = require('../controllers/admin/comments');
const auditController = require('../controllers/admin/audit');

router.get('/login', isGuest, authController.getLoginPage);
router.post('/login', isGuest, loginLimiter, authController.login);
router.get('/logout', authController.logout);

router.get('/', isAuthenticated, (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

router.get('/posts', isAuthenticated, postController.getPosts);
router.get('/posts/add', isAuthenticated, postController.getAddPostPage);
router.post('/posts/add', isAuthenticated, uploadImage.single('image'), handleUploadError, postController.addPost);
router.get('/posts/edit/:id', isAuthenticated, postController.getEditPostPage);
router.post('/posts/edit/:id', isAuthenticated, uploadImage.single('image'), handleUploadError, postController.updatePost);
router.post('/posts/delete/:id', isAuthenticated, postController.deletePost);

router.post('/posts/:id/approve', isAuthenticated, isAdmin, postController.approvePost);
router.post('/posts/:id/reject', isAuthenticated, isAdmin, postController.rejectPost);

router.post('/upload-image', isAuthenticated, uploadImage.single('file'), handleUploadError, postController.uploadImage);

router.get('/users', isAuthenticated, isAdmin, userController.getUsers);
router.get('/users/add', isAuthenticated, isAdmin, userController.getAddUserPage);
router.post('/users/add', isAuthenticated, isAdmin, userController.addUser);
router.get('/users/edit/:id', isAuthenticated, isAdmin, userController.getEditUserPage);
router.post('/users/edit/:id', isAuthenticated, isAdmin, userController.updateUser);
router.post('/users/delete/:id', isAuthenticated, isAdmin, userController.deleteUser);

router.get('/profile', isAuthenticated, userController.getProfilePage);
router.post('/profile', isAuthenticated, uploadImage.single('image'), handleUploadError, userController.updateProfile);
router.post('/profile/delete', isAuthenticated, userController.deleteMyAccount);

router.get('/messages', isAuthenticated, isAdmin, messageController.getMessages);
router.post('/messages/delete/:id', isAuthenticated, isAdmin, messageController.deleteMessage);

router.get('/categories', isAuthenticated, isAdmin, categoryController.getCategories);
router.get('/categories/add', isAuthenticated, isAdmin, categoryController.getAddCategoryPage);
router.post('/categories/add', isAuthenticated, isAdmin, categoryController.addCategory);
router.get('/categories/edit/:id', isAuthenticated, isAdmin, categoryController.getEditCategoryPage);
router.post('/categories/edit/:id', isAuthenticated, isAdmin, categoryController.updateCategory);
router.post('/categories/delete/:id', isAuthenticated, isAdmin, categoryController.deleteCategory);

router.get('/comments', isAuthenticated, isAdmin, commentController.getComments);
router.post('/comments/:id/approve', isAuthenticated, isAdmin, commentController.approveComment);
router.post('/comments/:id/reject', isAuthenticated, isAdmin, commentController.rejectComment);
router.post('/comments/delete/:id', isAuthenticated, isAdmin, commentController.deleteComment);
router.post('/comments/bulk-approve', isAuthenticated, isAdmin, commentController.bulkApprove);
router.post('/comments/bulk-delete', isAuthenticated, isAdmin, commentController.bulkDelete);

router.get('/audit', isAuthenticated, isAdmin, auditController.getAuditLogs);
router.post('/audit/clear-all', isAuthenticated, isAdmin, auditController.clearAllLogs);

module.exports = router;
