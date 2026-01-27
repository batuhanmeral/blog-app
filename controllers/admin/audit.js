const { stringify } = require('csv-stringify/sync');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');

const DANGEROUS_LEAD = /^[=+\-@\t\r]/;

function csvSafe(value) {
    if (value === null || value === undefined) return '';
    const s = String(value);
    return DANGEROUS_LEAD.test(s) ? "'" + s : s;
}

exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.action) query.action = String(req.query.action);
        if (req.query.username) query.username = String(req.query.username);

        const [logs, count, users, actions] = await Promise.all([
            AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            AuditLog.countDocuments(query),
            AuditLog.distinct('username'),
            AuditLog.distinct('action')
        ]);

        res.render('admin/audit/list', {
            title: 'İşlem Kayıtları',
            logs,
            users: users.sort(),
            actions: actions.sort(),
            pagination: { page, totalPages: Math.ceil(count / limit), total: count },
            filters: {
                action: req.query.action || '',
                username: req.query.username || ''
            }
        });
    } catch (err) {
        logger.error({ err }, 'getAuditLogs');
        res.status(500).send('Sunucu Hatası');
    }
};

exports.clearAllLogs = async (req, res) => {
    try {
        await AuditLog.deleteMany({});
        res.redirect('/admin/audit');
    } catch (err) {
        logger.error({ err }, 'clearAllLogs');
        res.status(500).send('Sunucu Hatası');
    }
};

exports.exportLogs = async (req, res) => {
    try {
        const format = (req.params.format || 'json').toLowerCase();
        const query = {};
        if (req.query.action) query.action = String(req.query.action);
        if (req.query.username) query.username = String(req.query.username);

        const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(10000).lean();

        if (format === 'csv') {
            const rows = logs.map(l => ({
                createdAt: l.createdAt.toISOString(),
                username: csvSafe(l.username),
                action: csvSafe(l.action),
                targetType: csvSafe(l.targetType),
                targetId: csvSafe(l.targetId),
                targetTitle: csvSafe(l.targetTitle),
                ipAddress: csvSafe(l.ipAddress),
                userAgent: csvSafe(l.userAgent)
            }));
            const csv = stringify(rows, { header: true });
            res.set('Content-Type', 'text/csv; charset=utf-8');
            res.set('Content-Disposition', 'attachment; filename="audit-log.csv"');
            return res.send(csv);
        }

        if (format !== 'json') {
            return res.status(400).send('Geçersiz biçim. csv veya json kullanın.');
        }

        res.set('Content-Type', 'application/json; charset=utf-8');
        res.set('Content-Disposition', 'attachment; filename="audit-log.json"');
        res.send(JSON.stringify(logs, null, 2));
    } catch (err) {
        logger.error({ err }, 'exportLogs');
        res.status(500).send('Export hatası');
    }
};
