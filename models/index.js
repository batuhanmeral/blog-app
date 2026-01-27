const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Contact = require('./Contact');
const Category = require('./Category');
const PostCategory = require('./PostCategory');
const AuditLog = require('./AuditLog');

User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

Post.belongsToMany(Category, { through: PostCategory, foreignKey: 'postId' });
Category.belongsToMany(Post, { through: PostCategory, foreignKey: 'categoryId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Post,
    Comment,
    Contact,
    Category,
    PostCategory,
    AuditLog
};
