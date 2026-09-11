// One-off admin script: revokes every workspace's OpenRouter key on
// OpenRouter's side, then deletes the corresponding OPENROUTER_API_KEY /
// OPENROUTER_API_KEY_HASH rows from environment_variable. Leaves every
// workspace with NO key — the next thing that calls
// WorkspaceService.hasModelAiKey() for a workspace will lazily provision a
// fresh one (see apps/api/src/features/workspace/service/workspace.service.ts).
//
// Unlike regenerate-openrouter-keys.ts, this does NOT issue new keys itself —
// it only tears down existing ones. AI features will be broken for a
// workspace until something triggers that lazy re-provisioning.
//
//   set -a; source .env; set +a
//   npx ts-node -r tsconfig-paths/register scripts/clean-openrouter-keys.ts [--dry-run]

import 'reflect-metadata';
import { OpenRouter } from '@openrouter/sdk';
import { WorkspaceEntity, EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { dataSource } from '@sandworm/postgresql-typeorm/data-source';

const OPENROUTER_API_KEY = 'OPENROUTER_API_KEY';
const OPENROUTER_API_KEY_HASH = 'OPENROUTER_API_KEY_HASH';

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const provisioningKey = process.env.OPENROUTER_PROVISIONING_KEY;
  if (!provisioningKey) {
    console.error('OPENROUTER_PROVISIONING_KEY is not set in the environment.');
    process.exit(1);
  }

  const client = new OpenRouter({ apiKey: provisioningKey });

  await dataSource.initialize();
  const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
  const envVarRepo = dataSource.getRepository(EnvironmentVariableEntity);

  const workspaces = await workspaceRepo.find({ select: ['id'] });
  console.log(`Found ${workspaces.length} workspace(s).${dryRun ? ' (dry run — no changes will be made)' : ''}`);

  let cleaned = 0;
  let failed = 0;

  for (const { id: workspaceId } of workspaces) {
    try {
      const existing = await envVarRepo.find({
        where: [
          { workspaceId, name: OPENROUTER_API_KEY },
          { workspaceId, name: OPENROUTER_API_KEY_HASH },
        ],
      });

      if (existing.length === 0) {
        console.log(`  skip: workspace ${workspaceId} has no OpenRouter key rows`);
        continue;
      }

      const hash = existing.find((v) => v.name === OPENROUTER_API_KEY_HASH)?.value ?? null;

      if (dryRun) {
        console.log(
          `[dry-run] workspace ${workspaceId}: would revoke ${hash ? `hash ${hash}` : '(no hash stored)'} and delete ${existing.length} row(s)`,
        );
        continue;
      }

      if (hash) {
        await client.apiKeys.delete({ hash }).catch((err) =>
          console.warn(`  warn: failed to revoke key for workspace ${workspaceId}: ${err.message}`),
        );
      }

      await envVarRepo.remove(existing);
      console.log(`  ok: workspace ${workspaceId} -> revoked and deleted ${existing.length} row(s)`);
      cleaned++;
    } catch (err) {
      console.error(`  fail: workspace ${workspaceId}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(dryRun ? 'Dry run complete.' : `Done. ${cleaned} cleaned, ${failed} failed.`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
