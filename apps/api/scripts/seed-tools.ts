// One-time migration: bulk-inserts the power tool catalog union (curated
// frontend definitions + apps/ai/src/example_tools/example.csv) into the
// `tool` table. Truncates any existing rows first — this is dev seed data,
// trivially regenerable from its two sources, not user-authored.
//
//   npx ts-node -r tsconfig-paths/register scripts/seed-tools.ts <union.json>

import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { ToolEntity } from '@sandworm/postgresql-typeorm';
import { dataSource } from '@sandworm/postgresql-typeorm/data-source';

interface DumpedTool {
  toolId: string;
  categoryId: string;
  name: string;
  description: string;
  tags: string[];
  params: unknown[];
  g1?: string | null;
  g2?: string | null;
  g3?: string | null;
  g4?: string | null;
  g5?: string | null;
  scope?: string | null;
  returns: unknown[];
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: seed-tools.ts <union.json>');
    process.exit(1);
  }

  const tools: DumpedTool[] = JSON.parse(readFileSync(inputPath, 'utf-8'));
  console.log(`Read ${tools.length} tools from ${inputPath}`);

  await dataSource.initialize();
  const repo = dataSource.getRepository(ToolEntity);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`Truncating "tool" (${existing} existing row(s)) before reseeding.`);
    await repo.clear();
  }

  const entities = tools.map((t) => repo.create(t));
  await repo.save(entities);

  console.log(`Inserted ${entities.length} rows into "tool".`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
