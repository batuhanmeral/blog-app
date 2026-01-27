const sanitizeHtml = require('sanitize-html');

const POST_HTML_OPTIONS = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'blockquote', 'code', 'pre']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'class', 'width', 'height', 'loading'],
        'a': ['href', 'target', 'rel'],
        // highlight.js dil ipucu için (örn. class="language-js")
        'code': ['class'],
        'pre': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
        'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    }
};

function sanitizePostHtml(html) {
    if (!html) return '';
    return sanitizeHtml(html, POST_HTML_OPTIONS);
}

function sanitizePostMarkdown(markdown) {
    if (!markdown) return '';
    return sanitizeHtml(markdown, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre', 'blockquote',
            'ul', 'ol', 'li', 'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
        allowedAttributes: {
            'a': ['href', 'title', 'target', 'rel'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'code': ['class'],
            'pre': ['class'],
            'span': ['class'],
            'div': ['class']
        },
        allowedSchemes: ['http', 'https', 'mailto']
    });
}

const SAFE_PATH_RE = /^\/assets\/uploads\/[A-Za-z0-9._\-\/]+$/;
const SAFE_URL_RE = /^https:\/\/[A-Za-z0-9.\-]+(:\d+)?\/[^\s<>"']*$/i;

function sanitizeImageUrl(value) {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    if (trimmed.length > 2000) return null;
    if (SAFE_PATH_RE.test(trimmed)) return trimmed;
    if (SAFE_URL_RE.test(trimmed)) return trimmed;
    return null;
}

module.exports = {
    sanitizePostHtml,
    sanitizePostMarkdown,
    sanitizeImageUrl,
    POST_HTML_OPTIONS
};
