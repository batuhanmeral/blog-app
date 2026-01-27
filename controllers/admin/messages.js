const Contact = require('../../models/Contact');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Contact.findAll({ order: [['date', 'DESC']] });
        res.render('admin/messages/list', { title: 'Gelen Mesajlar', messages });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        await Contact.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/messages');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};
