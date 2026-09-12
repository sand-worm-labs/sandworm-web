// One-off admin script: revokes and re-provisions the OpenRouter API key
// for every workspace. Use this after rotating OPENROUTER_PROVISIONING_KEY
// if you want every workspace's sub-key freshly issued under the new
// provisioning key (rotating the provisioning key alone does NOT affect
// already-issued sub-keys — this script is what actually replaces them).
//
// Does not touch Jupyter's live env sync (features/environment does, via
// EnvironmentService.setEnvironmentVariables -> JupyterService) — any
// notebook kernel already running for a workspace keeps its old key in
// memory until the kernel restarts.
//
//   npx env-cmd -f .env ts-node -r tsconfig-paths/register scripts/regenerate-openrouter-keys.ts [--dry-run]

import 'reflect-metadata';
import { OpenRouter } from '@openrouter/sdk';
import { CreateKeysLimitReset } from '@openrouter/sdk/models/operations';
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

  const defaultCap = process.env.OPENROUTER_DEFAULT_CAP
    ? parseFloat(process.env.OPENROUTER_DEFAULT_CAP)
    : 10.0;
  const limitReset = (process.env.OPENROUTER_LIMIT_RESET as CreateKeysLimitReset) ?? CreateKeysLimitReset.Monthly;

  const client = new OpenRouter({ apiKey: provisioningKey });

  await dataSource.initialize();
  const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
  const envVarRepo = dataSource.getRepository(EnvironmentVariableEntity);

  const workspaces = await workspaceRepo.find({ select: ['id'] });
  console.log(`Found ${workspaces.length} workspace(s).${dryRun ? ' (dry run — no changes will be made)' : ''}`);

  let succeeded = 0;
  let failed = 0;

  for (const { id: workspaceId } of workspaces) {
    try {
      const existing = await envVarRepo.find({
        where: [
          { workspaceId, name: OPENROUTER_API_KEY },
          { workspaceId, name: OPENROUTER_API_KEY_HASH },
        ],
      });
      const existingHash = existing.find((v) => v.name === OPENROUTER_API_KEY_HASH)?.value ?? null;

      if (dryRun) {
        console.log(
          `[dry-run] workspace ${workspaceId}: would revoke ${existingHash ? `hash ${existingHash}` : '(no existing key)'} and issue a new one`,
        );
        continue;
      }

      if (existingHash) {
        await client.apiKeys.delete({ hash: existingHash }).catch((err) =>
          console.warn(`  warn: failed to revoke old key for workspace ${workspaceId}: ${err.message}`),
        );
      }

      const { key, data } = await client.apiKeys.create({
        requestBody: {
          name: `workspace-${workspaceId}`,
          limit: defaultCap,
          limitReset,
        },
      });

      if (existing.length > 0) {
        await envVarRepo.remove(existing);
      }
      await envVarRepo.save(
        envVarRepo.create([
          { workspaceId, name: OPENROUTER_API_KEY, value: key },
          { workspaceId, name: OPENROUTER_API_KEY_HASH, value: data.hash },
        ]),
      );

      console.log(`  ok: workspace ${workspaceId} -> new key hash ${data.hash}`);
      succeeded++;
    } catch (err) {
      console.error(`  fail: workspace ${workspaceId}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(dryRun ? 'Dry run complete.' : `Done. ${succeeded} succeeded, ${failed} failed.`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
