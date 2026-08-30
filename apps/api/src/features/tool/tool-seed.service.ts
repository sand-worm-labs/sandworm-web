import { globSync, readFileSync } from 'fs';
import { join } from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolCategoryEntity, ToolEntity } from '@sandworm/postgresql-typeorm';
import { load } from 'js-yaml';
import { Repository } from 'typeorm';

// git submodule pointing at https://github.com/sand-worm-labs/tools —
// its own repo (schema-validated in CI), vendored in here rather than read
// across the ai submodule so apps/api can seed on its own regardless of how
// each service is deployed/containerized. One file per tool under catalog/
// <category>/, already normalized (clean param types, paired date ranges).
// Pinned to a submodule commit rather than fetched live so every boot —
// local, CI, prod — seeds the exact same catalog and files stay inspectable
// on disk instead of only visible mid-fetch.
const TOOLS_ROOT = join(__dirname, 'seed', 'tools');
const TOOLS_DIR = join(TOOLS_ROOT, 'catalog');
const CATEGORIES_FILE = join(TOOLS_ROOT, 'categories.yaml');

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
    await this.seedCategories();
    await this.seedTools();
  }

  // Small, fixed list — cheap enough to upsert every startup so it always
  // matches categories.yaml exactly (picks up additions/edits for free).
  private async seedCategories(): Promise<void> {
    const categories = load(readFileSync(CATEGORIES_FILE, 'utf-8')) as CategoryYaml[];
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

  // The catalog is ~1400 files and static, so mirror apps/ai's seed_tools.py:
  // skip entirely once the table has data rather than upserting every boot.
  private async seedTools(): Promise<void> {
    const existing = await this.toolRepository.count();
    if (existing > 0) {
      this.logger.log('tools already seeded, skipping');
      return;
    }

    const entities = this.loadTools();
    if (entities.length === 0) {
      this.logger.warn(`no tools loaded from ${TOOLS_DIR}`);
      return;
    }

    this.logger.log(`seeding ${entities.length} tools from ${TOOLS_DIR}`);
    const batchSize = 200;
    for (let i = 0; i < entities.length; i += batchSize) {
      await this.toolRepository.save(entities.slice(i, i + batchSize));
    }
    this.logger.log('tool seeding complete');
  }

  private loadTools(): ToolEntity[] {
    const files = globSync(`${TOOLS_DIR}/*/*.yaml`);
    const entities: ToolEntity[] = [];

    for (const file of files) {
      try {
        const tool = load(readFileSync(file, 'utf-8')) as ToolYaml;
        entities.push(
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
      } catch (err) {
        this.logger.warn(`skipping ${file}: ${(err as Error).message}`);
      }
    }

    return entities;
  }
}
