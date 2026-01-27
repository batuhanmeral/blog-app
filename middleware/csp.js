const crypto = require('crypto');
const helmet = require('helmet');

const isProd = process.env.NODE_ENV === 'production';

function nonceMiddleware(req, res, next) {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
    next();
}

// Helmet middleware'i modül yüklenirken bir kez kurulur; nonce değeri
// scriptSrc içindeki fonksiyon ile her istekte yeniden üretilir (helmet
// directive fonksiyon değerlerini istek başına değerlendirir).
const helmetWithNonce = helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    (req, res) => `'nonce-${res.locals.cspNonce}'`,
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                    "https://cdnjs.cloudflare.com",
                    "https://cdn.jsdelivr.net"
                ],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com", "https://picsum.photos", "https://*.picsum.photos"],
                connectSrc: ["'self'"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                upgradeInsecureRequests: isProd ? [] : null
            }
        },
        crossOriginEmbedderPolicy: false,
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
});

module.exports = { nonceMiddleware, helmetWithNonce };
