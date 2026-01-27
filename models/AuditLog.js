const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: [
            'LOGIN', 'LOGOUT',
            'CREATE_POST', 'UPDATE_POST', 'DELETE_POST',
            'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
            'READ_MESSAGE', 'DELETE_MESSAGE',
            'MEDIA_UPLOAD', 'MEDIA_DELETE',
            'APPROVE_COMMENT', 'SPAM_COMMENT', 'DELETE_COMMENT',
            'UPDATE_SETTINGS',
            'UPDATE_PROFILE', 'DELETE_PROFILE'
        ],
        required: true
    },
    targetType: String,
    targetId: String,
    targetTitle: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

auditLogSchema.index({ createdAt: -1 });

auditLogSchema.statics.log = async function (req, action, target = {}) {
    try {
        await this.create({
            username: req.session?.user?.username || 'system',
            action,
            targetType: target.type || null,
            targetId: target.id || null,
            targetTitle: target.title || null,
            details: target.details || null,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent')?.substring(0, 500)
        });
    } catch (err) {
        console.error('Audit log error:', err);
    }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
