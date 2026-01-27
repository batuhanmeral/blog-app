const Comment = require('../../models/Comment');
const Post = require('../../models/Post');

exports.getComments = async (req, res) => {
    try {
        let whereClause = {};
        
        if (req.query.status) {
            whereClause.status = req.query.status;
        }
        
        const comments = await Comment.findAll({ 
            where: whereClause,
            include: Post,
            order: [['date', 'DESC']] 
        });
        
        const stats = {
            pending: await Comment.count({ where: { status: 'pending' } }),
            approved: await Comment.count({ where: { status: 'approved' } }),
            rejected: await Comment.count({ where: { status: 'rejected' } })
        };
        
        res.render('admin/comments/list', { 
            title: 'Yorumlar', 
            comments,
            stats,
            currentStatus: req.query.status || 'all'
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.approveComment = async (req, res) => {
    try {
        await Comment.update(
            { status: 'approved' }, 
            { where: { id: req.params.id } }
        );
        res.redirect('/admin/comments?status=pending');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.rejectComment = async (req, res) => {
    try {
        await Comment.update(
            { status: 'rejected' }, 
            { where: { id: req.params.id } }
        );
        res.redirect('/admin/comments?status=pending');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.deleteComment = async (req, res) => {
    try {
        await Comment.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/comments');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.bulkApprove = async (req, res) => {
    try {
        const ids = req.body.commentIds;
        if (ids && ids.length > 0) {
            await Comment.update(
                { status: 'approved' },
                { where: { id: ids } }
            );
        }
        res.redirect('/admin/comments?status=pending');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const ids = req.body.commentIds;
        if (ids && ids.length > 0) {
            await Comment.destroy({ where: { id: ids } });
        }
        res.redirect('/admin/comments');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};
