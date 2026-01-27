const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
    level,
    redact: {
        paths: ['req.headers.cookie', 'req.headers.authorization', '*.password', '*.totpSecret'],
        censor: '[REDACTED]'
    },
    ...(isProd ? {} : {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' }
        }
    })
});

module.exports = logger;
