import {
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { generateKeyPairSync } from 'node:crypto';
import { AuthDynamicService } from '../auth-dynamic.service';

const pem = (key: any) =>
  key.export({ type: 'pkcs1', format: 'pem' }) as string;
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const jwt = new JwtService();
const service = (key?: string) =>
  new AuthDynamicService(jwt, {
    get: () => ({ publicKey: key }),
  } as unknown as ConfigService<any>);
const sign = (claims: object, expiresIn: string | number = '5m') =>
  jwt.signAsync(
    { scope: 'user:basic', ...claims },
    { privateKey: pem(privateKey), algorithm: 'RS256', expiresIn },
  );

describe('AuthDynamicService', () => {
  it('is unavailable until a public key is set', async () => {
    await expect(service().getProfileByToken('x')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('reads the account and the EVM wallets from a good token', async () => {
    const token = await sign({
      sub: 'u1',
      email: 'typed@b.co',
      verified_credentials: [
        { format: 'blockchain', chain: 'eip155', address: '0xABC' },
        { format: 'blockchain', chain: 'solana', address: 'So1' },
        { format: 'email', email: 'a@b.co' },
      ],
    });
    expect(
      await service(pem(publicKey)).getProfileByToken(token),
    ).toMatchObject({
      id: 'u1',
      email: 'a@b.co',
      wallets: ['0xabc'],
    });
  });

  it('ignores an email Dynamic did not verify', async () => {
    const token = await sign({ sub: 'u1', email: 'victim@b.co' });
    expect(
      (await service(pem(publicKey)).getProfileByToken(token)).email,
    ).toBeUndefined();
  });

  it.each([
    ['not a token', async () => 'nope'],
    ['an expired token', () => sign({ sub: 'u1' }, -5)],
    [
      'an unfinished sign-in',
      () =>
        jwt.signAsync(
          { sub: 'u1' },
          { privateKey: pem(privateKey), algorithm: 'RS256' },
        ),
    ],
    [
      'another key',
      () =>
        jwt.signAsync(
          { sub: 'u1', scope: 'user:basic' },
          {
            privateKey: pem(
              generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey,
            ),
            algorithm: 'RS256',
          },
        ),
    ],
  ])('refuses %s', async (_name, make) => {
    await expect(
      service(pem(publicKey)).getProfileByToken(await make()),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('checks a token with the environment key it names, from the published JWKS', async () => {
    const jwks = {
      keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'k1' }],
    };
    const fetchJwks = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ json: async () => jwks } as Response);
    const byEnvironment = new AuthDynamicService(jwt, {
      get: () => ({ environmentId: 'env1' }),
    } as unknown as ConfigService<any>);
    const signWith = (kid: string) =>
      jwt.signAsync(
        { sub: 'u1', scope: 'user:basic' },
        { privateKey: pem(privateKey), algorithm: 'RS256', keyid: kid },
      );

    expect(
      await byEnvironment.getProfileByToken(await signWith('k1')),
    ).toMatchObject({ id: 'u1' });
    expect(fetchJwks).toHaveBeenCalledWith(
      'https://app.dynamic.xyz/api/v0/sdk/env1/.well-known/jwks',
    );
    await expect(
      byEnvironment.getProfileByToken(await signWith('unknown')),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    fetchJwks.mockRestore();
  });
});
