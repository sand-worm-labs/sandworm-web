import { BadRequestException } from '@nestjs/common';
import { MAX_LOGO_BYTES, ShowcaseLogoService, sniffImageType } from '../showcase-logo.service';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]);

describe('sniffImageType', () => {
  it('knows PNG, JPEG and WebP by their first bytes', () => {
    expect(sniffImageType(PNG)).toBe('image/png');
    expect(sniffImageType(JPEG)).toBe('image/jpeg');
    expect(sniffImageType(WEBP)).toBe('image/webp');
  });

  it('refuses anything else, whatever it is named', () => {
    expect(sniffImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(sniffImageType(Buffer.from('GIF89a'))).toBeNull();
    expect(sniffImageType(Buffer.alloc(0))).toBeNull();
  });
});

describe('ShowcaseLogoService.save', () => {
  const setup = () => {
    const repository = {
      create: jest.fn((row: unknown) => row),
      save: jest.fn(),
    } as any;
    return { service: new ShowcaseLogoService(repository), repository };
  };
  const b64 = (data: Buffer) => data.toString('base64');

  it('stores an image with its sniffed type and a hash of its bytes', async () => {
    const { service, repository } = setup();
    await service.save('paj-cash', ' Paj Cash ', b64(PNG));

    const saved = repository.save.mock.calls[0][0];
    expect(saved).toMatchObject({ slug: 'paj-cash', name: 'Paj Cash', contentType: 'image/png' });
    expect(saved.etag).toMatch(/^[0-9a-f]{40}$/);
  });

  it('refuses a slug that is not a slug', async () => {
    const { service } = setup();
    await expect(service.save('Paj Cash', 'Paj Cash', b64(PNG))).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.save('../etc', 'x', b64(PNG))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses an empty, oversized or non-image upload', async () => {
    const { service, repository } = setup();
    await expect(service.save('a', 'A', '')).rejects.toThrow('empty');
    await expect(service.save('a', 'A', b64(Buffer.concat([PNG, Buffer.alloc(MAX_LOGO_BYTES)])))).rejects.toThrow('KB');
    await expect(service.save('a', 'A', b64(Buffer.from('not an image')))).rejects.toThrow('PNG, JPEG or WebP');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
