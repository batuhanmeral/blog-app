require('dotenv').config();
const { connectDB, mongoose } = require('../config/database');
const User = require('../models/User');
const Post = require('../models/Post');

(async () => {
    try {
        await connectDB();

        const total = await User.countDocuments();
        if (total === 0) {
            console.log('No users found. Run "npm run seed" first.');
            process.exit(0);
        }

        const adminCount = await User.countDocuments({ role: 'admin' });

        if (adminCount === 0) {
            const oldest = await User.findOne().sort({ createdAt: 1 });
            if (oldest) {
                oldest.role = 'admin';
                await oldest.save();
                console.log(`Promoted ${oldest.username} to admin.`);
            }
        }

        const missingRole = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'author' } }
        );
        if (missingRole.modifiedCount) {
            console.log(`Filled default role on ${missingRole.modifiedCount} user(s).`);
        }

        const missingAlgo = await User.updateMany(
            { passwordAlgo: { $exists: false } },
            { $set: { passwordAlgo: 'bcrypt' } }
        );
        if (missingAlgo.modifiedCount) {
            console.log(`Marked ${missingAlgo.modifiedCount} legacy bcrypt password(s) (lazy migration on next login).`);
        }

        // RBAC: sahipsiz yazıları en eski admin'e bağla
        const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
        if (admin) {
            const ownerless = await Post.updateMany(
                { $or: [{ author: { $exists: false } }, { author: null }] },
                { $set: { author: admin._id } }
            );
            if (ownerless.modifiedCount) {
                console.log(`Assigned author=${admin.username} to ${ownerless.modifiedCount} ownerless post(s).`);
            }
        }

        console.log('✅ Migration complete.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
