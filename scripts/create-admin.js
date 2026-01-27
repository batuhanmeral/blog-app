require('dotenv').config();
const { connectDB, mongoose } = require('../config/database');
const User = require('../models/User');

// Tek seferlik admin oluşturma/güncelleme aracı.
// Kullanım:
//   node scripts/create-admin.js <username> <password>
//   ADMIN_USERNAME=foo ADMIN_PASSWORD=bar node scripts/create-admin.js
//
// Var olan kullanıcı verilirse: parolası güncellenir ve rolü admin yapılır
// (veri silinmez). Yeni kullanıcıysa admin olarak oluşturulur.

(async () => {
    const username = (process.argv[2] || process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';

    if (!username || !password) {
        console.error('Usage: node scripts/create-admin.js <username> <password>');
        console.error('   or: ADMIN_USERNAME=... ADMIN_PASSWORD=... node scripts/create-admin.js');
        process.exit(1);
    }
    if (username.length < 3) {
        console.error('Username must be at least 3 characters.');
        process.exit(1);
    }
    if (password.length < 8) {
        console.error('Password must be at least 8 characters.');
        process.exit(1);
    }

    try {
        await connectDB();

        let user = await User.findOne({ username });
        if (user) {
            // Parola pre-save hook tarafından argon2 ile hash'lenir
            user.password = password;
            user.role = 'admin';
            user.mustChangePassword = false;
            await user.save();
            console.log(`✅ Existing user "${username}" updated -> role=admin, password reset.`);
        } else {
            user = await User.create({
                username,
                name: process.env.ADMIN_NAME || username,
                password,
                role: 'admin',
                mustChangePassword: false
            });
            console.log(`✅ Admin user "${username}" created.`);
        }

        console.log('   Sign in at: /admin/' + (process.env.ADMIN_LOGIN_PATH || 'login'));
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('create-admin failed:', err.message || err);
        process.exit(1);
    }
})();
