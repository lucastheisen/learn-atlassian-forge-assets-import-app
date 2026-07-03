import { buildUsersChunk } from "./lib/smoke-users.js";
import {
  callWebTrigger,
  type WebTriggerConnection,
  type WebTriggerResponse,
} from "./lib/webtrigger-client.js";

// deterministic chunk sizes spanning 1-5 records so the assertion step
// exercises aggregation (totals.keys / totals.records) across varied shapes,
// not just a single uniform chunk
const CHUNK_SIZES = [1, 3, 5, 2, 4];

async function assertOk(
  step: string,
  response: WebTriggerResponse,
): Promise<void> {
  console.log(`${step}: ${response.status} ${response.title}`);
  if (response.status !== 200) {
    throw new Error(`${step} failed: ${JSON.stringify(response)}`);
  }
}

function resolveConnection(): WebTriggerConnection {
  const url = process.env.FORGE_WEBTRIGGER_URL;
  if (!url) {
    throw new Error("FORGE_WEBTRIGGER_URL environment variable is required");
  }

  const secret = process.env.FORGE_WEBTRIGGER_SECRET;
  if (!secret) {
    throw new Error("FORGE_WEBTRIGGER_SECRET environment variable is required");
  }

  return { url, secret };
}

async function main(): Promise<void> {
  const connection = resolveConnection();
  const call = (action: Record<string, unknown>) =>
    callWebTrigger(action, connection);

  const uploadId = `smoke-${Date.now()}`;

  try {
    await assertOk(
      "upload-new",
      await call({ type: "upload-new", uploadId, testing: true }),
    );

    let expectedRecords = 0;
    for (const [index, size] of CHUNK_SIZES.entries()) {
      expectedRecords += size;
      await assertOk(
        `upload-data[${index}] (${size} users)`,
        await call({
          type: "upload-data",
          uploadId,
          index,
          data: buildUsersChunk(index, size),
        }),
      );
    }

    await assertOk(
      "upload-complete",
      await call({ type: "upload-complete", uploadId }),
    );

    await assertOk(
      "upload-smoke-assert-latest",
      await call({
        type: "upload-smoke-assert-latest",
        expectedKeys: CHUNK_SIZES.length,
        expectedRecords,
        expectedTopLevelKey: "users",
      }),
    );

    console.log(
      `smoke test passed: uploadId=${uploadId} chunks=${CHUNK_SIZES.length} records=${expectedRecords}`,
    );
  } catch (err) {
    console.error(`smoke test failed, aborting upload ${uploadId} for cleanup`);
    await call({ type: "upload-abort", uploadId }).catch(
      (abortErr: unknown) => {
        console.error(`upload-abort cleanup also failed: ${String(abortErr)}`);
      },
    );
    throw err;
  } finally {
    // testing uploads land in their own manifest keyspace (see
    // src/lib/kv-data.ts), so this can never prune real completed imports
    await call({ type: "prune", keepN: 0, testing: true })
      .then((response) =>
        console.log(`prune (testing): ${response.status} ${response.title}`),
      )
      .catch((pruneErr: unknown) =>
        console.error(`cleanup prune failed: ${String(pruneErr)}`),
      );
  }
}

await main();
