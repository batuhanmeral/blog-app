const Comment = require('../../models/Comment');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');

const STATUSES = ['pending', 'approved', 'spam'];

exports.getComments = async (req, res) => {
    try {
        const status = STATUSES.includes(req.query.status) ? req.query.status : 'pending';

        const [comments, counts] = await Promise.all([
            Comment.find({ status }).populate('post', 'title').sort({ createdAt: -1 }).limit(200).lean(),
            Comment.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])
        ]);

        const countMap = Object.fromEntries(counts.map(c => [c._id, c.n]));

        res.render('admin/comments/list', {
            title: 'Yorumlar',
            comments,
            status,
            counts: {
                pending: countMap.pending || 0,
                approved: countMap.approved || 0,
                spam: countMap.spam || 0
            }
        });
    } catch (err) {
        logger.error({ err }, 'getComments');
        res.status(500).send('Hata');
    }
};

async function moderate(req, res, status, action) {
    const back = '/admin/comments?status=' + (STATUSES.includes(req.body.from) ? req.body.from : 'pending');
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        req.flash('error', 'Yorum bulunamadı.');
        return res.redirect(back);
    }
    comment.status = status;
    await comment.save();
    await AuditLog.log(req, action, { type: 'Comment', id: comment._id, title: comment.name });
    req.flash('success', 'Yorum güncellendi.');
    res.redirect(back);
}

exports.approveComment = (req, res) =>
    moderate(req, res, 'approved', 'APPROVE_COMMENT').catch(err => {
        logger.error({ err }, 'approveComment');
        res.status(500).send('Hata');
    });

exports.spamComment = (req, res) =>
    moderate(req, res, 'spam', 'SPAM_COMMENT').catch(err => {
        logger.error({ err }, 'spamComment');
        res.status(500).send('Hata');
    });

exports.deleteComment = async (req, res) => {
    const back = '/admin/comments?status=' + (STATUSES.includes(req.body.from) ? req.body.from : 'pending');
    try {
        const comment = await Comment.findById(req.params.id);
        if (comment) {
            await comment.deleteOne();
            await AuditLog.log(req, 'DELETE_COMMENT', { type: 'Comment', id: comment._id, title: comment.name });
        }
        req.flash('success', 'Yorum silindi.');
        res.redirect(back);
    } catch (err) {
        logger.error({ err }, 'deleteComment');
        res.status(500).send('Hata');
    }
};
