import { createGunzip } from 'zlib';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolCategoryEntity, ToolEntity } from '@sandworm/postgresql-typeorm';
import axios from 'axios';
import { load } from 'js-yaml';
import { extract } from 'tar-stream';
import { Repository } from 'typeorm';

// Fetched live over HTTP on every boot rather than vendored on disk (no git
// submodule, no local copy) — sand-worm-labs/tools is the single source of
// truth. Mirrors apps/ai's seed_tools.py. One request for the whole catalog,
// parsed entirely in memory.
const CATALOG_TARBALL_URL = 'https://codeload.github.com/sand-worm-labs/tools/tar.gz/refs/heads/main';

interface CategoryYaml {
  category_id: string;
  name: string;
  description: string;
}

interface ToolYaml {
  tool_id: string;
  g1: string;
  g2?: string;
  g3?: string;
  g4?: string;
  g5?: string;
  description: string;
  scope?: string;
  returns?: Array<{ name: string; type: string }>;
  inputs?: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    default?: unknown;
  }>;
}

interface FetchedCatalog {
  categories: CategoryYaml[];
  tools: ToolYaml[];
}

function deriveName(toolId: string): string {
  const lastSegment = toolId.split('.').pop() ?? toolId;
  return lastSegment
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Injectable()
export class ToolSeedService implements OnModuleInit {
  private readonly logger = new Logger(ToolSeedService.name);

  constructor(
    @InjectRepository(ToolEntity)
    private readonly toolRepository: Repository<ToolEntity>,
    @InjectRepository(ToolCategoryEntity)
    private readonly toolCategoryRepository: Repository<ToolCategoryEntity>,
  ) { }

  async onModuleInit(): Promise<void> {
    const catalog = await this.fetchCatalog();
    await this.seedCategories(catalog.categories);
    await this.seedTools(catalog.tools);
  }

  // Streams the repo's tarball straight into a gunzip + tar extractor —
  // nothing ever touches disk. Every *.yaml under catalog/ is a tool;
  // categories.yaml (repo root) is the taxonomy.
  private async fetchCatalog(): Promise<FetchedCatalog> {
    const response = await axios.get<NodeJS.ReadableStream>(CATALOG_TARBALL_URL, {
      responseType: 'stream',
    });

    const categories: CategoryYaml[] = [];
    const tools: ToolYaml[] = [];

    await new Promise<void>((resolve, reject) => {
      const extractor = extract();

      extractor.on('entry', (header, stream, next) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          try {
            if (header.name.endsWith('/categories.yaml')) {
              categories.push(...(load(Buffer.concat(chunks).toString('utf-8')) as CategoryYaml[]));
            } else if (header.name.includes('/catalog/') && header.name.endsWith('.yaml')) {
              tools.push(load(Buffer.concat(chunks).toString('utf-8')) as ToolYaml);
            }
          } catch (err) {
            this.logger.warn(`skipping ${header.name}: ${(err as Error).message}`);
          }
          next();
        });
        stream.on('error', reject);
        stream.resume();
      });

      extractor.on('finish', resolve);
      extractor.on('error', reject);

      response.data.pipe(createGunzip()).pipe(extractor);
    });

    this.logger.log(`fetched ${categories.length} categories and ${tools.length} tools from ${CATALOG_TARBALL_URL}`);
    return { categories, tools };
  }

  // Small, fixed list — cheap enough to upsert every startup so it always
  // matches categories.yaml exactly (picks up additions/edits for free).
  private async seedCategories(categories: CategoryYaml[]): Promise<void> {
    await this.toolCategoryRepository.save(
      categories.map((category) =>
        this.toolCategoryRepository.create({
          categoryId: category.category_id,
          name: category.name,
          description: category.description,
        }),
      ),
    );
    this.logger.log(`upserted ${categories.length} tool categories`);
  }

  // The catalog is ~1400 tools and static, so mirror apps/ai's seed_tools.py:
  // skip entirely once the table has data rather than upserting every boot.
  private async seedTools(tools: ToolYaml[]): Promise<void> {
    const existing = await this.toolRepository.count();
    if (existing > 0) {
      this.logger.log('tools already seeded, skipping');
      return;
    }

    if (tools.length === 0) {
      this.logger.warn('no tools fetched from catalog tarball');
      return;
    }

    const entities = tools.map((tool) =>
      this.toolRepository.create({
        toolId: tool.tool_id,
        categoryId: tool.g1,
        name: deriveName(tool.tool_id),
        description: tool.description ?? '',
        tags: [],
        params: tool.inputs ?? [],
        g1: tool.g1,
        g2: tool.g2,
        g3: tool.g3,
        g4: tool.g4,
        g5: tool.g5,
        scope: tool.scope || 'generic',
        returns: tool.returns ?? [],
      }),
    );

    this.logger.log(`seeding ${entities.length} tools`);
    const batchSize = 200;
    for (let i = 0; i < entities.length; i += batchSize) {
      await this.toolRepository.save(entities.slice(i, i + batchSize));
    }
    this.logger.log('tool seeding complete');
  }
}
