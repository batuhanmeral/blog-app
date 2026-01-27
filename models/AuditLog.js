const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    action: {
        type: Sequelize.ENUM(
            'LOGIN', 'LOGOUT',
            'CREATE_POST', 'UPDATE_POST', 'DELETE_POST',
            'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
            'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
            'APPROVE_COMMENT', 'DELETE_COMMENT',
            'READ_MESSAGE', 'DELETE_MESSAGE',
            'UPDATE_SETTINGS'
        ),
        allowNull: false
    },
    targetType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    targetId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    targetTitle: {
        type: Sequelize.STRING,
        allowNull: true
    },
    details: {
        type: Sequelize.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('details');
            return value ? JSON.parse(value) : null;
        },
        set(value) {
            this.setDataValue('details', value ? JSON.stringify(value) : null);
        }
    },
    ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
    },
    userAgent: {
        type: Sequelize.STRING(500),
        allowNull: true
    }
});

AuditLog.log = async (req, action, target = {}) => {
    try {
        await AuditLog.create({
            userId: req.session?.user?.id || 0,
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

module.exports = AuditLog;
