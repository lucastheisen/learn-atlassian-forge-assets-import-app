import { buildUsersChunk } from "./smoke-users.js";
import {
  callWebTrigger,
  type WebTriggerConnection,
  type WebTriggerResponse,
} from "./webtrigger-client.js";

const CHUNK_SIZES = [1, 3, 5, 2, 4];
const OBJECT_TYPE_NAME = "Smoke User";
const STATUS_POLL_INTERVAL_MS = 3000;
const STATUS_POLL_TIMEOUT_MS = 300000;

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
  const startedAt = Date.now();
  const deadline = startedAt + STATUS_POLL_TIMEOUT_MS;
  let nextProgressAt = startedAt;
  let lastResponse: WebTriggerResponse | undefined;
  console.log(`${step}: waiting (timeout ${STATUS_POLL_TIMEOUT_MS / 1000}s)`);
  while (Date.now() < deadline) {
    lastResponse = await callWebTrigger(action, connection);
    if (lastResponse.status === 200) {
      console.log(`${step}: ${lastResponse.status} ${lastResponse.title}`);
      return;
    }
    if (Date.now() >= nextProgressAt) {
      console.log(
        `${step}: still waiting after ${Math.floor((Date.now() - startedAt) / 1000)}s (HTTP ${lastResponse.status})`,
      );
      nextProgressAt = Date.now() + 15_000;
    }
    await sleep(STATUS_POLL_INTERVAL_MS);
  }
  throw new Error(
    `${step} timed out after ${STATUS_POLL_TIMEOUT_MS}ms: ${JSON.stringify(lastResponse)}`,
  );
}

export interface SmokeImportTarget {
  workspaceId: string;
  importSourceId: string;
}

export async function runImportSmoke(
  connection: WebTriggerConnection,
  target: SmokeImportTarget,
  email?: string,
): Promise<void> {
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
          data: buildUsersChunk(index, size, {
            title: runId,
            ...(email && index === 0 ? { email } : {}),
          }),
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

    const assertReferences = (baseline?: "remember" | "verify") =>
      pollUntilOk(
        `import-smoke-assert (references${baseline ? `, ${baseline}` : ""})`,
        {
          type: "import-smoke-assert",
          ...target,
          expectedStatus: "DONE",
          referenceSync: {
            uploadId: runId,
            email,
            expectedUnresolved: expectedRecords - (email ? 1 : 0),
            baseline,
          },
        },
        connection,
      );
    await assertReferences(email ? "remember" : undefined);
    if (email) {
      await assertOk(
        "import-start (identical repeat)",
        await call({ type: "import-start", ...target, testing: true }),
      );
      await assertReferences("verify");
    }

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
    await pollUntilOk(
      "import-smoke-cleanup (wait for lifecycle)",
      {
        type: "import-smoke-cleanup",
        ...target,
        objectTypeName: OBJECT_TYPE_NAME,
        runId,
      },
      connection,
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
