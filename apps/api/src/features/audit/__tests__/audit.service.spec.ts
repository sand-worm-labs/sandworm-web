import { redact } from '../audit.service';

describe('redact', () => {
  it('masks sensitive keys at any depth', () => {
    expect(redact({ email: 'a@b.c', password: 'x', nested: { apiKey: 'k', value: 'v', ok: 1 } })).toEqual({
      email: 'a@b.c',
      password: '[redacted]',
      nested: { apiKey: '[redacted]', value: '[redacted]', ok: 1 },
    });
  });

  it('masks OAuth callback params', () => {
    expect(redact({ code: 'c', state: 's', scope: 'email' })).toEqual({ code: '[redacted]', state: '[redacted]', scope: 'email' });
  });

  it('truncates long strings and deep objects', () => {
    expect((redact('x'.repeat(600)) as string).length).toBe(501);
    expect(redact({ a: { b: { c: { d: { e: 1 } } } } })).toEqual({ a: { b: { c: { d: '[truncated]' } } } });
  });
});
