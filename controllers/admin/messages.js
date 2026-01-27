const Contact = require('../../models/Contact');
const AuditLog = require('../../models/AuditLog');
const logger = require('../../utils/logger');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.render('admin/messages/list', { title: 'Gelen Mesajlar', messages });
    } catch (err) {
        logger.error({ err }, 'getMessages');
        res.status(500).send('Hata');
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findById(req.params.id);
        if (message) {
            await AuditLog.log(req, 'DELETE_MESSAGE', {
                type: 'Contact',
                id: message._id,
                title: message.name
            });
        }

        await Contact.findByIdAndDelete(req.params.id);
        res.redirect('/admin/messages');
    } catch (err) {
        logger.error({ err }, 'deleteMessage');
        res.status(500).send('Hata');
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, { isRead: true });

        await AuditLog.log(req, 'READ_MESSAGE', {
            type: 'Contact',
            id: req.params.id
        });

        res.redirect('/admin/messages');
    } catch (err) {
        logger.error({ err }, 'markAsRead');
        res.status(500).send('Hata');
    }
};
