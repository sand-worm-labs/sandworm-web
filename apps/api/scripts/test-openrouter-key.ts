// Standalone diagnostic: calls OpenRouter's apiKeys.get()/list() directly,
// outside NestJS, and prints the RAW error/response (not wrapped by
// OpenRouterService.tagOpenRouterError, which only keeps err.message).
// Use this to see the actual status code / body OpenRouter returns.
//
//   set -a; source .env; set +a
//   npx ts-node -r tsconfig-paths/register scripts/test-openrouter-key.ts <workspaceId>

import 'reflect-metadata';
import { OpenRouter } from '@openrouter/sdk';
import { WorkspaceEntity, EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { dataSource } from '@sandworm/postgresql-typeorm/data-source';

async function main() {
  const workspaceId = process.argv[2];
  if (!workspaceId) {
    console.error('Usage: test-openrouter-key.ts <workspaceId>');
    process.exit(1);
  }

  const provisioningKey = process.env.OPENROUTER_PROVISIONING_KEY;
  if (!provisioningKey) {
    console.error('OPENROUTER_PROVISIONING_KEY is not set in the environment.');
    process.exit(1);
  }
  console.log(`Using provisioning key: ${provisioningKey.slice(0, 12)}...${provisioningKey.slice(-4)}`);

  const client = new OpenRouter({ apiKey: provisioningKey });

  await dataSource.initialize();
  const envVarRepo = dataSource.getRepository(EnvironmentVariableEntity);
  const workspaceRepo = dataSource.getRepository(WorkspaceEntity);

  const workspace = await workspaceRepo.findOne({ where: { id: workspaceId } });
  if (!workspace) {
    console.error(`No workspace found with id ${workspaceId}`);
    process.exit(1);
  }

  const hashRow = await envVarRepo.findOne({
    where: { workspaceId, name: 'OPENROUTER_API_KEY_HASH' },
  });
  console.log(`Stored hash for workspace ${workspaceId}: ${hashRow?.value ?? '(none)'}`);

  console.log('\n--- Listing ALL keys visible under this provisioning key ---');
  try {
    const { data } = await client.apiKeys.list({});
    console.log(`Found ${data.length} key(s) on this account:`);
    for (const k of data) {
      console.log(`  hash=${k.hash} name=${k.name} disabled=${k.disabled}`);
    }
    if (hashRow) {
      const match = data.find((k) => k.hash === hashRow.value);
      console.log(match ? '\n=> Stored hash IS present in this list.' : '\n=> Stored hash is NOT in this list.');
    }
  } catch (err) {
    console.error('list() raw error:', err);
  }

  if (hashRow) {
    console.log(`\n--- Calling apiKeys.get({ hash: ${hashRow.value} }) directly ---`);
    try {
      const result = await client.apiKeys.get({ hash: hashRow.value });
      console.log('get() raw success response:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('get() raw error object:');
      console.error(err);
    }
  }

  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
