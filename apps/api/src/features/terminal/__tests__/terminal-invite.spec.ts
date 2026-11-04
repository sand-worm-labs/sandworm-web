import { canClaimInvite, normaliseEmail } from '../terminal-invite';

describe('normaliseEmail', () => {
  it('trims and lower-cases, so the invite matches however it was typed', () => {
    expect(normaliseEmail('  Maya@Robinhood.COM ')).toBe('maya@robinhood.com');
  });
});

describe('canClaimInvite', () => {
  it('needs an email the person has verified', () => {
    expect(canClaimInvite({ email: 'a@b.co', emailVerified: true })).toBe(true);
    expect(
      canClaimInvite({ email: 'a@b.co', emailVerifiedAt: new Date() }),
    ).toBe(true);
  });

  it('refuses an unverified or missing email', () => {
    expect(canClaimInvite({ email: 'a@b.co', emailVerified: false })).toBe(
      false,
    );
    expect(canClaimInvite({ email: 'a@b.co' })).toBe(false);
    expect(canClaimInvite({ emailVerified: true })).toBe(false);
    expect(canClaimInvite({ email: '', emailVerified: true })).toBe(false);
  });
});
