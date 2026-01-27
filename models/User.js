const mongoose = require('mongoose');
const argon2 = require('argon2');
const bcrypt = require('bcrypt');

const ROLES = ['admin', 'editor', 'author'];

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 32
    },
    name: {
        type: String,
        default: '',
        maxlength: 80
    },
    password: {
        type: String,
        required: true
    },
    passwordAlgo: {
        type: String,
        enum: ['argon2', 'bcrypt'],
        default: 'argon2'
    },
    role: {
        type: String,
        enum: ROLES,
        default: 'author'
    },
    totpSecret: {
        type: String,
        default: null
    },
    totpEnabled: {
        type: Boolean,
        default: false
    },
    totpBackupCodes: {
        type: [String],
        default: []
    },
    mustChangePassword: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await argon2.hash(this.password, { type: argon2.argon2id });
        this.passwordAlgo = 'argon2';
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidate) {
    if (!candidate) return false;

    if (this.passwordAlgo === 'argon2') {
        try {
            return await argon2.verify(this.password, candidate);
        } catch {
            return false;
        }
    }

    const ok = await bcrypt.compare(candidate, this.password);
    if (ok) {
        this.password = candidate;
        this.passwordAlgo = 'argon2';
        try { await this.save(); } catch { /* logged elsewhere */ }
    }
    return ok;
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
