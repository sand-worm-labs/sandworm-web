import { Params } from 'nestjs-pino';
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const pinoLoggerConfig: Params = {
    pinoHttp: {
        level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

        transport: isDevelopment
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:HH:MM:ss.l',
                    ignore: 'pid,hostname',
                    singleLine: false,
                    messageFormat: '{levelLabel} [{context}] {msg}',
                    errorLikeObjectKeys: ['err', 'error'],
                },
            }
            : undefined,

        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                // Remove query params and headers for cleaner logs
            }),
            res: (res) => ({
                statusCode: res.statusCode,
            }),
        },

        // Redact sensitive information
        redact: {
            paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["x-api-key"]',
            ],
            censor: '**REDACTED**',
        },

        // Custom log levels
        customLogLevel: (req, res, err) => {
            if (res.statusCode >= 500 || err) return 'error';
            if (res.statusCode >= 400) return 'warn';
            if (res.statusCode >= 300) return 'info';
            return 'debug';
        },

        // Don't log health checks and other noise
        autoLogging: {
            ignore: (req) => {
                const ignoredPaths = ['/health', '/metrics', '/_next'];
                return ignoredPaths.some((path) => req.url?.startsWith(path));
            },
        },
    },
};