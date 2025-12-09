import { BadRequestException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

/**
 * Validates that a string is a valid UUID v4
 * @throws BadRequestException if validation fails
 */
export function validateUUID(id: string | null | undefined, fieldName: string): void {
  if (!id) {
    throw new BadRequestException(`${fieldName} is required`);
  }

  if (typeof id !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string`);
  }

  if (!uuidValidate(id)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }
}

/**
 * Validates that a string is not empty
 * @throws BadRequestException if validation fails
 */
export function validateNonEmptyString(value: string | null | undefined, fieldName: string): void {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${fieldName} is required and must be a non-empty string`);
  }
}

/**
 * Validates string length
 * @throws BadRequestException if validation fails
 */
export function validateStringLength(value: string, fieldName: string, maxLength: number): void {
  if (value.length > maxLength) {
    throw new BadRequestException(`${fieldName} must be ${maxLength} characters or less`);
  }
}