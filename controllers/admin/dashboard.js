const Post = require('../../models/Post');
const Contact = require('../../models/Contact');
const Category = require('../../models/Category');
const AuditLog = require('../../models/AuditLog');
const Visit = require('../../models/Visit');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const logger = require('../../utils/logger');

function lastNDays(n) {
    const days = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

exports.getDashboard = async (req, res) => {
    try {
        const days = lastNDays(30);
        const startDay = days[0];

        const user = req.session.user;
        const isAuthorOnly = user.role === 'author';
        const canSeeMessages = user.role === 'admin' || user.role === 'editor';
        const canSeeComments = user.role === 'admin' || user.role === 'editor';
        const isAdminUser = user.role === 'admin';

        // author yalnızca kendi içeriğinin istatistiklerini görür
        const postFilter = isAuthorOnly ? { author: user.id } : {};

        const visitMatch = { day: { $gte: startDay } };
        if (isAuthorOnly) {
            const myPostIds = await Post.find({ author: user.id }).distinct('_id');
            visitMatch.postId = { $in: myPostIds };
        }

        const [postCount, categoryCount, totalViews, categoryCounts, dailyVisits,
            messageCount, auditLogCount, userCount, commentCount, pendingCommentCount] = await Promise.all([
                Post.countDocuments(postFilter),
                Category.countDocuments({ archived: { $ne: true } }),
                Post.aggregate([
                    { $match: postFilter },
                    { $group: { _id: null, total: { $sum: '$viewCount' } } }
                ]),
                Post.aggregate([
                    { $match: postFilter },
                    { $unwind: '$categories' },
                    { $group: { _id: '$categories', count: { $sum: 1 } } },
                    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
                    { $unwind: '$cat' },
                    { $project: { name: '$cat.name', color: '$cat.color', count: 1 } },
                    { $sort: { count: -1 } }
                ]),
                Visit.aggregate([
                    { $match: visitMatch },
                    { $group: { _id: '$day', count: { $sum: 1 } } }
                ]),
                canSeeMessages ? Contact.countDocuments() : Promise.resolve(null),
                isAdminUser ? AuditLog.countDocuments() : Promise.resolve(null),
                isAdminUser ? User.countDocuments() : Promise.resolve(null),
                canSeeComments ? Comment.countDocuments() : Promise.resolve(null),
                canSeeComments ? Comment.countDocuments({ status: 'pending' }) : Promise.resolve(null)
            ]);

        const visitMap = Object.fromEntries(dailyVisits.map(v => [v._id, v.count]));
        const traffic = days.map(d => ({ day: d, count: visitMap[d] || 0 }));

        res.render('admin/dashboard', {
            title: 'Yönetim Paneli',
            stats: {
                posts: postCount,
                messages: messageCount,
                categories: categoryCount,
                totalViews: totalViews[0]?.total || 0,
                auditLogs: auditLogCount,
                users: userCount,
                comments: commentCount,
                pendingComments: pendingCommentCount
            },
            categoryCounts,
            traffic,
            user
        });
    } catch (err) {
        logger.error({ err }, 'getDashboard');
        res.status(500).send('Sunucu Hatası');
    }
};
