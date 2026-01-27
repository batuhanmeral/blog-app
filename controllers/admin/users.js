const User = require('../../models/User');
const Post = require('../../models/Post');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin/users/list', { title: 'Kullanıcılar', users, user: req.session.user });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.getAddUserPage = (req, res) => {
    res.render('admin/users/add', { title: 'Yeni Kullanıcı Ekle' });
};

exports.addUser = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await User.create({
            username: req.body.username,
            name: req.body.name,
            password: hashedPassword,
            role: req.body.role || 'writer'
        });
        res.redirect('/admin/users');
    } catch (err) {
        console.log(err);
        res.status(500).send("Hata");
    }
};

exports.getEditUserPage = async (req, res) => {
    try {
        const userToEdit = await User.findByPk(req.params.id);
        if (!userToEdit) {
            return res.status(404).send('Kullanıcı bulunamadı');
        }
        res.render('admin/users/edit', { title: 'Kullanıcıyı Düzenle', userToEdit });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const existingUser = await User.findByPk(req.params.id);
        if (!existingUser) {
            return res.status(404).send('Kullanıcı bulunamadı');
        }
        
        const updateData = {
            username: req.body.username,
            name: req.body.name,
            role: req.body.role
        };

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        }

        await User.update(updateData, { where: { id: req.params.id } });
        res.redirect('/admin/users');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.session.user.id) {
            return res.status(400).send('Kendi hesabınızı bu şekilde silemezsiniz. Profil sayfasından hesabınızı silebilirsiniz.');
        }
        
        const userToDelete = await User.findByPk(req.params.id);
        if (!userToDelete) {
            return res.status(404).send('Kullanıcı bulunamadı');
        }
        
        await User.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/users');
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.getProfilePage = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id);
        res.render('admin/profile', { title: 'Profilim', user: user });
    } catch (err) {
        console.log(err);
        res.status(500).send('Hata');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updateData = {
            username: req.body.username,
            name: req.body.name
        };

        if (req.file) {
            updateData.profileImage = '/assets/uploads/' + req.file.filename;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        }

        await User.update(updateData, { where: { id: req.session.user.id } });

        const updatedUser = await User.findByPk(req.session.user.id);
        req.session.user = {
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            role: updatedUser.role
        };

        res.redirect('/admin/profile');
    } catch (err) {
        console.log(err);
        res.status(500).send('Güncelleme hatası');
    }
};

exports.deleteMyAccount = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.session.user.id } });
        req.session.destroy(() => {
            res.redirect('/');
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Silme hatası');
    }
};
