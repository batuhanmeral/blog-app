const notFoundHandler = (req, res, next) => {
    res.status(404).render('errors/404', {
        title: 'Sayfa Bulunamadı',
        message: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
        path: req.path
    });
};

const globalErrorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    const isDev = process.env.NODE_ENV !== 'production';
    const statusCode = err.statusCode || 500;
    const message = isDev ? err.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(isDev && { stack: err.stack })
        });
    }
    
    res.status(statusCode).render('errors/500', {
        title: 'Sunucu Hatası',
        message: message,
        ...(isDev && { error: err, stack: err.stack })
    });
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
