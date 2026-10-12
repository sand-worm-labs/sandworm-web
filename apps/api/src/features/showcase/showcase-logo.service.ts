import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShowcaseProtocolLogoEntity } from '@sandworm/postgresql-typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';

export const LOGO_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Logos are shown at 64px at most: the studio sends 256px, so this leaves room.
export const MAX_LOGO_BYTES = 256 * 1024;

// The type of an image from its first bytes: a file name or a claimed type is not trusted.
export function sniffImageType(data: Buffer): string | null {
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png';
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP')
    return 'image/webp';
  return null;
}

// Protocol logos: read for the public image route, written by the studio.
@Injectable()
export class ShowcaseLogoService {
  constructor(
    @InjectRepository(ShowcaseProtocolLogoEntity)
    private readonly logoRepository: Repository<ShowcaseProtocolLogoEntity>,
  ) {}

  find(slug: string) {
    return this.logoRepository.findOne({ where: { slug } });
  }

  // Every logo's slug and version, without the bytes.
  async list() {
    const rows = await this.logoRepository.find({
      select: { slug: true, name: true, etag: true, updatedAt: true },
      order: { slug: 'ASC' },
    });
    return rows.map(({ slug, name, etag, updatedAt }) => ({ slug, name, etag, updatedAt }));
  }

  async save(slug: string, name: string, base64: string): Promise<void> {
    if (!LOGO_SLUG.test(slug) || slug.length > 80) {
      throw new BadRequestException('The slug uses lowercase letters, numbers and single dashes');
    }
    const data = Buffer.from(base64, 'base64');
    if (data.length === 0) throw new BadRequestException('The image is empty');
    if (data.length > MAX_LOGO_BYTES) {
      throw new BadRequestException(`The image is over ${MAX_LOGO_BYTES / 1024} KB. Send a 256px PNG`);
    }
    const contentType = sniffImageType(data);
    if (!contentType) throw new BadRequestException('Use a PNG, JPEG or WebP image');

    await this.logoRepository.save(
      this.logoRepository.create({
        slug,
        name: name.trim() || slug,
        contentType,
        data,
        etag: createHash('sha1').update(data).digest('hex'),
      }),
    );
  }

  async remove(slug: string): Promise<boolean> {
    const result = await this.logoRepository.delete({ slug });
    return (result.affected ?? 0) > 0;
  }
}
