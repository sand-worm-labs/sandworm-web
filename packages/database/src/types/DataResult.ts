export type ServiceResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error?: string;
      message: string;
      code: string;
      details?: any;
    };

export class DataResult {
  static success<T>(data: T): ServiceResult<T> {
    return { success: true, data };
  }

  static failure<T>(
    message: string,
    code: string,
    details?: any
  ): ServiceResult<T> {
    return { success: false, message, code, details };
  }
}

export function createSuccessResult<T>(payload: T): ServiceResult<T> {
  return { success: true, data: payload };
}

export function createFailureResult<T>(
  message: string,
  code: string,
  details?: any
): ServiceResult<T> {
  return { success: false, message, code, details };
}
