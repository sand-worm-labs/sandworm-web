// I18nContext.current() reads from an async-local-storage-backed static
// context that only exists inside a real request lifecycle — stub it so the
// filter can be exercised outside of one.
const mockI18nContext = { t: jest.fn((key: string) => `translated:${key}`) };
jest.mock('nestjs-i18n', () => ({
  I18nContext: { current: jest.fn(() => mockI18nContext) },
}));

import {
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationException } from '@sandworm/api';
import { GraphQLError } from 'graphql';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { GlobalExceptionFilter } from '../global-exception.filter';

function makeFilter(debug = false) {
  const httpAdapter = { reply: jest.fn() };
  const httpAdapterHost = { httpAdapter } as any;
  const filter = new GlobalExceptionFilter(httpAdapterHost, debug);
  return { filter, httpAdapter };
}

function makeHttpHost() {
  const response = {};
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getResponse: () => response }),
  } as any;
}

function makeGraphQLHost() {
  return {
    getType: () => 'graphql',
    switchToHttp: () => ({ getResponse: () => ({}) }),
  } as any;
}

describe('GlobalExceptionFilter', () => {
  beforeEach(() => {
    mockI18nContext.t.mockClear();
  });

  describe('catch (HTTP requests)', () => {
    it('maps an UnprocessableEntityException to a validation error response', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new UnprocessableEntityException({
        message: [{ property: 'name', constraints: { isString: 'name must be a string' } }],
      });

      filter.catch(exception, makeHttpHost());

      const [, error, statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(error.message).toBe('Validation failed');
    });

    it('maps a ValidationException using the i18n translation when no explicit message is set', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new ValidationException('app.user.not_found');

      filter.catch(exception, makeHttpHost());

      expect(mockI18nContext.t).toHaveBeenCalledWith('app.user.not_found');
      const [, error] = httpAdapter.reply.mock.calls[0];
      expect(error.message).toBe('translated:app.user.not_found');
    });

    it('maps a ValidationException using its explicit message when provided', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new ValidationException('app.user.not_found', 'Custom message');

      filter.catch(exception, makeHttpHost());

      const [, error] = httpAdapter.reply.mock.calls[0];
      expect(error.message).toBe('Custom message');
    });

    it('maps a generic HttpException to its status and message', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);

      filter.catch(exception, makeHttpHost());

      const [, error, statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(error.message).toBe('Forbidden resource');
    });

    it('maps a unique-constraint QueryFailedError to a 409 with a translated message', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new QueryFailedError('INSERT ...', [], new Error('duplicate key') as any);
      (exception as any).constraint = 'UQ_user_email';

      filter.catch(exception, makeHttpHost());

      expect(mockI18nContext.t).toHaveBeenCalledWith('app.common.error.unique_email');
      const [, error, statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('falls back to the raw constraint name when it has no known translation', () => {
      const { filter } = makeFilter();
      const exception = new QueryFailedError('INSERT ...', [], new Error('duplicate key') as any);
      (exception as any).constraint = 'UQ_unmapped_constraint';

      filter.catch(exception, makeHttpHost());

      expect(mockI18nContext.t).toHaveBeenCalledWith('UQ_unmapped_constraint');
    });

    it('maps a non-unique-constraint QueryFailedError to a 500 internal server error', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new QueryFailedError('INSERT ...', [], new Error('fk violation') as any);
      (exception as any).constraint = 'FK_something';

      filter.catch(exception, makeHttpHost());

      expect(mockI18nContext.t).toHaveBeenCalledWith('app.common.internal_server_error');
      const [, , statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('maps a QueryFailedError with no constraint to a 500 internal server error', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new QueryFailedError('INSERT ...', [], new Error('boom') as any);

      filter.catch(exception, makeHttpHost());

      const [, , statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('maps an EntityNotFoundError to a 404 with the error message', () => {
      const { filter, httpAdapter } = makeFilter();
      class Widget {}
      const exception = new EntityNotFoundError(Widget, { id: '1' });

      filter.catch(exception, makeHttpHost());

      const [, error, statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error.message).toBe(exception.message);
    });

    it('maps an unrecognized error to a generic 500 response', () => {
      const { filter, httpAdapter } = makeFilter();
      const exception = new Error('something unexpected');

      filter.catch(exception, makeHttpHost());

      const [, error, statusCode] = httpAdapter.reply.mock.calls[0];
      expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.message).toBe('something unexpected');
    });

    it('attaches stack/trace to the error payload when debug is enabled', () => {
      const { filter, httpAdapter } = makeFilter(true);
      const exception = new Error('boom');

      filter.catch(exception, makeHttpHost());

      const [, error] = httpAdapter.reply.mock.calls[0];
      expect(error.stack).toBe(exception.stack);
      expect(error.trace).toBe(exception);
    });

    it('does not attach stack/trace when debug is disabled', () => {
      const { filter, httpAdapter } = makeFilter(false);
      const exception = new Error('boom');

      filter.catch(exception, makeHttpHost());

      const [, error] = httpAdapter.reply.mock.calls[0];
      expect(error.stack).toBeUndefined();
      expect(error.trace).toBeUndefined();
    });
  });

  describe('catch (GraphQL requests)', () => {
    it('returns a GraphQLError carrying the mapped error as extensions', () => {
      const { filter } = makeFilter();
      const exception = new HttpException('Not allowed', HttpStatus.FORBIDDEN);

      const result = filter.catch(exception, makeGraphQLHost());

      expect(result).toBeInstanceOf(GraphQLError);
      expect((result as GraphQLError).message).toBe('Not allowed');
      expect((result as GraphQLError).extensions.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
