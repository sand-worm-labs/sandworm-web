import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { OPEN_DATA_SOURCES } from '../open-data.ts';

// The AI service plans from a JSON copy of this catalog. open-data.ts is the
// one to edit; the command to regenerate the copy is in
// apps/ai/src/services/open_data/service.py.
const AI_COPY = new URL('../../../../../ai/src/services/open_data/sources.json', import.meta.url);

test('the AI service copy of the open data catalog is up to date', { skip: !existsSync(AI_COPY) }, () => {
  assert.deepEqual(JSON.parse(readFileSync(AI_COPY, 'utf8')), OPEN_DATA_SOURCES);
});
