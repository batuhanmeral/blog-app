const Post = require('../../models/Post');
const User = require('../../models/User');
const Contact = require('../../models/Contact');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const AuditLog = require('../../models/AuditLog');
const { Sequelize } = require('sequelize');

exports.getDashboard = async (req, res) => {
    try {
        let postCount;
        let totalViews;
        
        if (req.session.user.role === 'admin') {
            postCount = await Post.count();
            totalViews = await Post.sum('viewCount') || 0;
        } else {
            postCount = await Post.count({ where: { userId: req.session.user.id } });
            totalViews = await Post.sum('viewCount', { where: { userId: req.session.user.id } }) || 0;
        }

        const userCount = await User.count();
        const messageCount = await Contact.count();
        const categoryCount = await Category.count();
        const auditLogCount = await AuditLog.count();

        let pendingPostsCount = 0;
        let pendingCommentsCount = 0;
        
        if (req.session.user.role === 'admin') {
            pendingPostsCount = await Post.count({ where: { status: 'pending' } });
            pendingCommentsCount = await Comment.count({ where: { status: 'pending' } });
        }

        res.render('admin/dashboard', {
            title: 'Yönetim Paneli',
            stats: {
                posts: postCount,
                users: userCount,
                messages: messageCount,
                categories: categoryCount,
                totalViews: totalViews,
                pendingPosts: pendingPostsCount,
                pendingComments: pendingCommentsCount,
                auditLogs: auditLogCount
            },
            user: req.session.user
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};
