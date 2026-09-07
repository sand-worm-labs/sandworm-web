import { BadRequestException } from '@nestjs/common';
import { validateUUID, validateNonEmptyString, validateStringLength } from '../uuid';

describe('validateUUID', () => {
  it('does not throw for a valid UUID v4', () => {
    expect(() => validateUUID('550e8400-e29b-41d4-a716-446655440000', 'id')).not.toThrow();
  });

  it('throws BadRequestException when the value is missing', () => {
    expect(() => validateUUID(undefined, 'id')).toThrow(BadRequestException);
    expect(() => validateUUID(null, 'id')).toThrow('id is required');
  });

  it('throws BadRequestException when the value is not a string', () => {
    expect(() => validateUUID(123 as any, 'id')).toThrow('id must be a string');
  });

  it('throws BadRequestException when the value is not a valid UUID', () => {
    expect(() => validateUUID('not-a-uuid', 'id')).toThrow('id must be a valid UUID');
  });
});

describe('validateNonEmptyString', () => {
  it('does not throw for a non-empty string', () => {
    expect(() => validateNonEmptyString('hello', 'name')).not.toThrow();
  });

  it('throws when the value is undefined', () => {
    expect(() => validateNonEmptyString(undefined, 'name')).toThrow(BadRequestException);
  });

  it('throws when the value is an empty/whitespace-only string', () => {
    expect(() => validateNonEmptyString('   ', 'name')).toThrow(
      'name is required and must be a non-empty string',
    );
  });
});

describe('validateStringLength', () => {
  it('does not throw when the string is within the max length', () => {
    expect(() => validateStringLength('abc', 'name', 5)).not.toThrow();
  });

  it('throws BadRequestException when the string exceeds the max length', () => {
    expect(() => validateStringLength('abcdef', 'name', 5)).toThrow(
      'name must be 5 characters or less',
    );
  });

  it('does not throw when the string length equals the max length', () => {
    expect(() => validateStringLength('abcde', 'name', 5)).not.toThrow();
  });
});
