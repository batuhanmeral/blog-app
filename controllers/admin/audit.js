const AuditLog = require('../../models/AuditLog');
const User = require('../../models/User');

exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;

        const where = {};
        if (req.query.action) {
            where.action = req.query.action;
        }
        if (req.query.username) {
            where.username = req.query.username;
        }

        const { count, rows: logs } = await AuditLog.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        const users = await AuditLog.findAll({
            attributes: ['username'],
            group: ['username'],
            order: [['username', 'ASC']]
        });

        const actions = await AuditLog.findAll({
            attributes: ['action'],
            group: ['action'],
            order: [['action', 'ASC']]
        });

        res.render('admin/audit/list', {
            title: 'İşlem Kayıtları',
            logs,
            users: users.map(u => u.username),
            actions: actions.map(a => a.action),
            pagination: {
                page,
                totalPages,
                total: count
            },
            filters: {
                action: req.query.action || '',
                username: req.query.username || ''
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};

exports.clearAllLogs = async (req, res) => {
    try {
        await AuditLog.destroy({ where: {}, truncate: true });
        res.redirect('/admin/audit');
    } catch (err) {
        console.log(err);
        res.status(500).send('Sunucu Hatası');
    }
};
