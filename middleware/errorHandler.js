const logger = require('../utils/logger');

const notFoundHandler = (req, res) => {
    const t = req.t || ((k) => k);
    res.status(404).render('errors/404', {
        title: t('errors.404_title'),
        path: req.path
    });
};

const globalErrorHandler = (err, req, res, next) => {
    logger.error({ err }, 'Unhandled error');

    const t = req.t || ((k) => k);
    const isDev = process.env.NODE_ENV !== 'production';
    const statusCode = err.statusCode || 500;
    const message = isDev ? err.message : t('errors.500_msg');
    
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(isDev && { stack: err.stack })
        });
    }
    
    res.status(statusCode).render('errors/500', {
        title: t('errors.500_title'),
        message: message,
        ...(isDev && { error: err, stack: err.stack })
    });
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
