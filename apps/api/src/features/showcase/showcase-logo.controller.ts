import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { LOGO_SLUG, ShowcaseLogoService } from './showcase-logo.service';

// DefiLlama serves an icon for most DeFi protocols at their slug.
const LLAMA_ICONS = 'https://icons.llamao.fi/icons/protocols';
const CACHE = 'public, max-age=3600, stale-while-revalidate=86400';

// A protocol's logo, for an <img>. The studio's upload if there is one; otherwise it sends
// the browser to DefiLlama's icon, so a protocol added in the studio shows its logo with
// nothing else done. If neither has one the image fails to load and the page shows the
// protocol's initial.
@ApiExcludeController()
@Controller('showcase/logos')
export class ShowcaseLogoController {
  constructor(private readonly logos: ShowcaseLogoService) {}

  @Get(':slug')
  @ApiPublic({ summary: "A Showcase protocol's logo" })
  async get(
    @Param('slug') slug: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    if (!LOGO_SLUG.test(slug) || slug.length > 80) {
      return reply.status(HttpStatus.NOT_FOUND).send();
    }

    const logo = await this.logos.find(slug);
    if (!logo) {
      return reply
        .status(HttpStatus.FOUND)
        .header('Location', `${LLAMA_ICONS}/${slug}`)
        .header('Cache-Control', CACHE)
        .send();
    }

    const etag = `"${logo.etag}"`;
    reply
      .header('ETag', etag)
      .header('Cache-Control', CACHE)
      // Helmet's default would stop another origin from showing it.
      .header('Cross-Origin-Resource-Policy', 'cross-origin');
    if (request.headers['if-none-match'] === etag) {
      return reply.status(HttpStatus.NOT_MODIFIED).send();
    }
    return reply.status(HttpStatus.OK).header('Content-Type', logo.contentType).send(logo.data);
  }
}
