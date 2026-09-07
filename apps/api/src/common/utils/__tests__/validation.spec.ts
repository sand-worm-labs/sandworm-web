import { isWorkspaceNameValid, isUserNameValid, getQueryDuration } from '../validation';

describe('isWorkspaceNameValid', () => {
  it('accepts alphanumeric names with spaces and hyphens', () => {
    expect(isWorkspaceNameValid('My Workspace-1')).toBe(true);
  });

  it('rejects names with disallowed special characters', () => {
    expect(isWorkspaceNameValid('My/Workspace!')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isWorkspaceNameValid('')).toBe(false);
  });
});

describe('isUserNameValid', () => {
  it('accepts alphanumeric names with spaces and hyphens', () => {
    expect(isUserNameValid('John-Doe 2')).toBe(true);
  });

  it('rejects names with disallowed special characters', () => {
    expect(isUserNameValid('John@Doe')).toBe(false);
  });
});

describe('getQueryDuration', () => {
  it('returns 0 when result is null', () => {
    expect(getQueryDuration(null)).toBe(0);
  });

  it('returns queryDurationMs when present (V2/V3 shape)', () => {
    const result = { queryDurationMs: 42 } as any;

    expect(getQueryDuration(result)).toBe(42);
  });

  it('returns durationMs when queryDurationMs is absent (V1 shape)', () => {
    const result = { durationMs: 17 } as any;

    expect(getQueryDuration(result)).toBe(17);
  });

  it('returns 0 when neither duration field is present', () => {
    const result = {} as any;

    expect(getQueryDuration(result)).toBe(0);
  });

  it('prefers queryDurationMs over durationMs when both are present', () => {
    const result = { queryDurationMs: 5, durationMs: 99 } as any;

    expect(getQueryDuration(result)).toBe(5);
  });
});
