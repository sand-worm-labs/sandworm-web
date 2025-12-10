// apps/api/src/filters/global-exception.filter.ts

import { ConstraintErrors } from '@/constants/constraint-errors';
import { ErrorCode } from '@/constants/error-code.constant';
import { I18nTranslations } from '@/generated/i18n.generated';
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
import {
  ErrorDto,
  GraphqlErrorCode,
  handleError,
  handleHttpException,
  handleUnprocessableEntityException,
  ValidationException,
} from '@sandworm/graphql';
import { GraphQLError } from 'graphql';
import { STATUS_CODES } from 'http';
import { I18nContext } from 'nestjs-i18n';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private i18n: I18nContext<I18nTranslations>;
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly debug: boolean,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    this.i18n = I18nContext.current<I18nTranslations>(host);
    const contextType = host.getType<string>();

    // Process the exception into ErrorDto (common logic)
    const error = this.processException(exception);

    // Add debug info if enabled
    if (this.debug) {
      this.logger.debug(error);
    }

    // Format response based on context type
    if (contextType === 'graphql') {
      return this.handleGraphQLError(exception, error);
    } else {
      return this.handleHttpError(error, host);
    }
  }

  /**
   * Process exception into ErrorDto (shared logic for both HTTP and GraphQL)
   */
  private processException(exception: any): ErrorDto {
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

    return error;
  }

  /**
   * Handle GraphQL errors - return GraphQLError with extensions
   */
  private handleGraphQLError(exception: any, error: ErrorDto): GraphQLError {
    return new GraphQLError(exception.message || error.message, {
      extensions: { ...error },
    });
  }

  /**
   * Handle HTTP errors - send via HttpAdapter
   */
  private handleHttpError(error: ErrorDto, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    httpAdapter.reply(ctx.getResponse(), error, error.statusCode);
  }

  /**
   * Handles validation errors
   * @param exception ValidationException
   * @returns ErrorDto
   */
  private handleValidationException(exception: ValidationException): ErrorDto {
    const r = exception.getResponse() as {
      errorCode: ErrorCode;
      message: string;
    };
    const statusCode = exception.getStatus();

    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      errorCode:
        Object.keys(ErrorCode)[Object.values(ErrorCode).indexOf(r.errorCode)],
      code: GraphqlErrorCode.FAILED_PRECONDITION, // Include for GraphQL
      message:
        r.message ||
        this.i18n.t(r.errorCode as unknown as keyof I18nTranslations),
    };

    return errorRes;
  }

  /**
   * Handles QueryFailedError
   * @param error QueryFailedError
   * @returns ErrorDto
   */
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

    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: STATUS_CODES[status],
      code:
        status === HttpStatus.CONFLICT
          ? GraphqlErrorCode.CONFLICT
          : GraphqlErrorCode.INTERNAL_SERVER_ERROR,
      message,
    } as unknown as ErrorDto;

    return errorRes;
  }

  /**
   * Handles EntityNotFoundError when using findOrFail() or findOneOrFail() from TypeORM
   * @param error EntityNotFoundError
   * @returns ErrorDto
   */
  private handleEntityNotFoundError(error: EntityNotFoundError): ErrorDto {
    const status = HttpStatus.NOT_FOUND;
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: STATUS_CODES[status],
      code: GraphqlErrorCode.NOT_FOUND,
      message: error.message,
    } as unknown as ErrorDto;

    return errorRes;
  }
}