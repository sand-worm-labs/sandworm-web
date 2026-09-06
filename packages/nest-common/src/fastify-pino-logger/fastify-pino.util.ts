import { FastifyLoggerOptions, PinoLoggerOptions } from 'fastify/types/logger';
import hyperid from 'hyperid';
import pino from 'pino';

export const REQUEST_ID_HEADER = 'X-Request-Id';

// pino's default `err` serializer copies every enumerable own property of a
// caught error verbatim — including a full `.raw` copy of the original error
// — with no check for binary values. If any property (however deeply nested)
// is a Buffer/Uint8Array/ArrayBuffer, JSON.stringify renders it as
// `{"type":"Buffer","data":[...]}`, an unreadable byte-array dump instead of
// a usable log line. This wraps the default serializer and replaces any
// binary payload with a short placeholder so error logs stay readable text.
function sanitizeLoggedValue(value: unknown, seen: WeakSet<object>): unknown {
  if (
    Buffer.isBuffer(value) ||
    value instanceof Uint8Array ||
    value instanceof ArrayBuffer
  ) {
    const byteLength =
      value instanceof ArrayBuffer ? value.byteLength : value.length;
    return `[binary data omitted: ${byteLength} bytes]`;
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[circular]';
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLoggedValue(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key,
      sanitizeLoggedValue(val, seen),
    ]),
  );
}

export function errSerializer(err: unknown) {
  const serialized = pino.stdSerializers.err(err as Error) as Record<
    string,
    unknown
  >;
  // `.raw` duplicates the whole original error object (and whatever binary
  // properties it carries) — the rest of `serialized` already has its
  // properties flattened out individually, so `.raw` is redundant.
  const { raw: _raw, ...rest } = serialized;
  return sanitizeLoggedValue(rest, new WeakSet());
}

export type FastifyLoggerEnv =
  | 'local'
  | 'development'
  | 'staging'
  | 'production';

const developmentLogger = (): any => {
  return {
    messageKey: 'msg',
    errorKey: 'err',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
      },
    },
    level: 'debug',
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        id: req.id,
        path: req.routeOptions.url,
        parameters: req.params,
        headers: req.headers,
      }),
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
      err: errSerializer,
    },
    customSuccessMessage,
    customReceivedMessage,
    customErrorMessage,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.body.token',
        'req.body.refreshToken',
        'req.body.email',
        'req.body.password',
        'req.body.oldPassword',
      ],
      censor: '**GDPR COMPLIANT**',
    },
  } as FastifyLoggerOptions & PinoLoggerOptions;
};

const customSuccessMessage = (req: any, res: any, responseTime: number) => {
  return `[${req.id || '*'}] "${req.method} ${req.url}" ${res.statusCode} - "${req.headers['host']}" "${req.headers['user-agent']}" - ${responseTime} ms`;
};

const customReceivedMessage = (req: any) => {
  return `[${req.id || '*'}] "${req.method} ${req.url}"`;
};

const customErrorMessage = (req: any, res: any, err: any) => {
  return `[${req.id || '*'}] "${req.method} ${req.url}" ${res.statusCode} - "${req.headers['host']}" "${req.headers['user-agent']}" - message: ${err.message}`;
};

export function genReqId() {
  return (req: any) => req.headers[REQUEST_ID_HEADER] || hyperid().uuid;
}

export function fastifyPinoOptions(
  env: FastifyLoggerEnv,
): (FastifyLoggerOptions & PinoLoggerOptions) | boolean {
  const envToLogger = {
    local: developmentLogger(),
    development: developmentLogger(),
    production: {
      level: 'debug',
      serializers: { err: errSerializer },
    },
    staging: {
      level: 'debug',
      serializers: { err: errSerializer },
    },
  } as const;

  return envToLogger[env] ?? true;
}
