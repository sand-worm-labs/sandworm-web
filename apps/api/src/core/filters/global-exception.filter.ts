import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GqlExceptionFilter } from '@nestjs/graphql';
import {
  ErrorDto,
  handleError,
  handleHttpException,
  handleUnprocessableEntityException,
  ValidationException,
} from '@sandworm/api';
import { GraphQLError } from 'graphql';
import { STATUS_CODES } from 'http';
import { I18nContext } from 'nestjs-i18n';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ConstraintErrors } from '../constants/constraint-errors';
import { ErrorCode } from '../constants/error-code.constant';
import { I18nTranslations } from '@/generated/i18n.generated';

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter {
  private i18n: I18nContext<I18nTranslations>;
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly debug: boolean,
  ) { }

  catch(exception: any, host: ArgumentsHost) {
    this.i18n = I18nContext.current<I18nTranslations>(host);
    let error: ErrorDto;

    if (exception instanceof UnprocessableEntityException) {
      error = handleUnprocessableEntityException(exception);
    } else if (exception instanceof ValidationException) {
      error = this.handleValidationException(exception);
    } else if (exception instanceof HttpException) {
      error = handleHttpException(exception);
    } else if (exception instanceof QueryFailedError) {
      this.logger.error(exception);
      error = this.handleQueryFailedError(exception);
    } else if (exception instanceof EntityNotFoundError) {
      this.logger.debug(exception);
      error = this.handleEntityNotFoundError(exception);
    } else {
      this.logger.error(exception);
      error = handleError(exception);
    }

    if (this.debug) {
      error.stack = exception.stack;
      error.trace = exception;
      this.logger.debug(error);
    }

    // Check if this is a GraphQL request
    if (host.getType<string>() === 'graphql') {
      return new GraphQLError(exception.message, { extensions: { ...error } });
    }

    // HTTP request
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    httpAdapter.reply(ctx.getResponse(), error, error.statusCode);
  }

  private handleValidationException(exception: ValidationException): ErrorDto {
    const r = exception.getResponse() as {
      errorCode: ErrorCode;
      message: string;
    };
    const statusCode = exception.getStatus();

    return {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      errorCode:
        Object.keys(ErrorCode)[Object.values(ErrorCode).indexOf(r.errorCode)],
      message:
        r.message ||
        this.i18n.t(r.errorCode as unknown as keyof I18nTranslations),
    };
  }

  private handleQueryFailedError(error: QueryFailedError): ErrorDto {
    const r = error as QueryFailedError & { constraint?: string };
    const { status, message } = r.constraint?.startsWith('UQ')
      ? {
        status: HttpStatus.CONFLICT,
        message: r.constraint
          ? this.i18n.t(
            (ConstraintErrors[r.constraint] ||
              r.constraint) as keyof I18nTranslations,
          )
          : undefined,
      }
      : {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('app.common.internal_server_error'),
      };

    return {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: STATUS_CODES[status],
      message,
    } as unknown as ErrorDto;
  }

  private handleEntityNotFoundError(error: EntityNotFoundError): ErrorDto {
    const status = HttpStatus.NOT_FOUND;
    return {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: STATUS_CODES[status],
      message: error.message,
    } as unknown as ErrorDto;
  }
}