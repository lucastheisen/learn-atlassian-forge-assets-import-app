import { buildUsersChunk } from "./lib/smoke-users.js";
import {
  callWebTrigger,
  type WebTriggerConnection,
  type WebTriggerResponse,
} from "./lib/webtrigger-client.js";

const CHUNK_SIZES = [1, 3, 5, 2, 4];
const OBJECT_TYPE_NAME = "Smoke User";
const STATUS_POLL_INTERVAL_MS = 3000;
const STATUS_POLL_TIMEOUT_MS = 120000;

async function assertOk(
  step: string,
  response: WebTriggerResponse,
): Promise<void> {
  console.log(`${step}: ${response.status} ${response.title}`);
  if (response.status !== 200) {
    throw new Error(`${step} failed: ${JSON.stringify(response)}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollUntilOk(
  step: string,
  action: Record<string, unknown>,
  connection: WebTriggerConnection,
): Promise<void> {
  const deadline = Date.now() + STATUS_POLL_TIMEOUT_MS;
  let lastResponse: WebTriggerResponse | undefined;
  while (Date.now() < deadline) {
    lastResponse = await callWebTrigger(action, connection);
    if (lastResponse.status === 200) {
      console.log(`${step}: ${lastResponse.status} ${lastResponse.title}`);
      return;
    }
    await sleep(STATUS_POLL_INTERVAL_MS);
  }
  throw new Error(
    `${step} timed out after ${STATUS_POLL_TIMEOUT_MS}ms: ${JSON.stringify(lastResponse)}`,
  );
}

interface SmokeImportTarget {
  workspaceId: string;
  importSourceId: string;
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

function resolveSmokeImportTarget(): SmokeImportTarget {
  const workspaceId = process.env.FORGE_SMOKE_WORKSPACE_ID;
  const importSourceId = process.env.FORGE_SMOKE_IMPORT_SOURCE_ID;
  if (!workspaceId || !importSourceId) {
    throw new Error(
      "FORGE_SMOKE_WORKSPACE_ID and FORGE_SMOKE_IMPORT_SOURCE_ID environment variables are " +
        "required - see docs/DEVELOPMENT.md for one-time setup of a dedicated Smoke Test import source",
    );
  }

  return { workspaceId, importSourceId };
}

async function main(): Promise<void> {
  const connection = resolveConnection();
  const target = resolveSmokeImportTarget();
  const call = (action: Record<string, unknown>) =>
    callWebTrigger(action, connection);

  const runId = `smoke-import-${Date.now()}`;

  try {
    await assertOk(
      "upload-new",
      await call({ type: "upload-new", uploadId: runId, testing: true }),
    );

    let expectedRecords = 0;
    for (const [index, size] of CHUNK_SIZES.entries()) {
      expectedRecords += size;
      await assertOk(
        `upload-data[${index}] (${size} users)`,
        await call({
          type: "upload-data",
          uploadId: runId,
          index,
          data: buildUsersChunk(index, size, { title: runId }),
        }),
      );
    }

    await assertOk(
      "upload-complete",
      await call({ type: "upload-complete", uploadId: runId }),
    );

    await assertOk(
      "import-start",
      await call({
        type: "import-start",
        workspaceId: target.workspaceId,
        importSourceId: target.importSourceId,
        testing: true,
      }),
    );

    await pollUntilOk(
      "import-smoke-assert (status)",
      {
        type: "import-smoke-assert",
        workspaceId: target.workspaceId,
        importSourceId: target.importSourceId,
        expectedStatus: "DONE",
      },
      connection,
    );

    await pollUntilOk(
      "import-smoke-assert (objects)",
      {
        type: "import-smoke-assert",
        workspaceId: target.workspaceId,
        importSourceId: target.importSourceId,
        expectedStatus: "DONE",
        objects: {
          objectTypeName: OBJECT_TYPE_NAME,
          runId,
          expectedCount: expectedRecords,
        },
      },
      connection,
    );

    console.log(
      `smoke test passed: runId=${runId} chunks=${CHUNK_SIZES.length} records=${expectedRecords}`,
    );
  } catch (err) {
    console.error(`smoke test failed, aborting upload ${runId} for cleanup`);
    await call({ type: "upload-abort", uploadId: runId }).catch(
      (abortErr: unknown) => {
        console.error(`upload-abort cleanup also failed: ${String(abortErr)}`);
      },
    );
    throw err;
  } finally {
    await call({
      type: "import-smoke-cleanup",
      workspaceId: target.workspaceId,
      objectTypeName: OBJECT_TYPE_NAME,
      runId,
    })
      .then((response) =>
        console.log(
          `import-smoke-cleanup: ${response.status} ${response.title}`,
        ),
      )
      .catch((cleanupErr: unknown) =>
        console.error(`import-smoke-cleanup failed: ${String(cleanupErr)}`),
      );

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
