import { writeFile } from "node:fs/promises";
import {
  type SmokeClientReport,
  type SmokeImportOptions,
  SmokeImportOptionsSchema,
  type SmokeStep,
} from "./import-smoke-schemas.js";
import { buildUsersChunk } from "./smoke-users.js";
import {
  callWebTrigger,
  type WebTriggerConnection,
  type WebTriggerResponse,
  WebTriggerTransportError,
} from "./webtrigger-client.js";

export type { SmokeClientReport, SmokeStep } from "./import-smoke-schemas.js";

const CHUNK_SIZES = [1, 3, 5, 2, 4];

const OBJECT_TYPE_NAME = "Smoke User";

const POLL_INTERVAL_MS = 3000;

const REQUEST_TIMEOUT_MS = 30000;

export interface SmokeImportTarget {
  importSourceId: string;
  workspaceId: string;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function runImportSmoke(
  connection: WebTriggerConnection,
  target: SmokeImportTarget,
  email?: string,
  reportPath?: string,
  options: SmokeImportOptions = {},
): Promise<SmokeClientReport> {
  const settings = SmokeImportOptionsSchema.parse(options);
  const chunkSizes =
    settings.userCount === 15
      ? CHUNK_SIZES
      : [
          1,
          ...Array.from(
            { length: Math.ceil((settings.userCount - 1) / 50) },
            (_, index) => Math.min(50, settings.userCount - 1 - index * 50),
          ),
        ];
  const start = Date.now();
  const runId = `smoke-import-${start}`;
  const report: SmokeClientReport = {
    durationMs: 0,
    finishedAt: "",
    inputChunks: chunkSizes.length,
    inputRecords: settings.userCount,
    requireContinuation: settings.requireContinuation,
    startedAt: new Date(start).toISOString(),
    status: "failed",
    steps: [],
    uploadId: runId,
  };

  console.log(
    `smoke run ${runId}, ${settings.userCount} users in ${chunkSizes.length} chunks`,
  );

  async function step(
    name: string,
    action: Record<string, unknown>,
    poll = false,
  ): Promise<void> {
    const startedAt = Date.now();
    const deadline =
      startedAt + (poll ? settings.pollTimeoutMs : REQUEST_TIMEOUT_MS);
    const record: SmokeStep = {
      durationMs: 0,
      name,
      phases: [],
      requests: 0,
      status: "failed",
    };
    report.steps.push(record);
    let lastPhase = "";
    let nextProgressAt = startedAt;
    console.log(
      `${name}, starting${poll ? ` (timeout ${settings.pollTimeoutMs / 1000}s)` : ""}`,
    );
    try {
      do {
        record.requests++;
        let response: WebTriggerResponse;
        try {
          response = await callWebTrigger(
            action,
            connection,
            AbortSignal.timeout(
              Math.max(1, Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now())),
            ),
          );
        } catch (error) {
          if (
            !poll ||
            !(error instanceof WebTriggerTransportError) ||
            Date.now() >= deadline
          )
            throw error;
          console.log(
            `${name}, request failed. Retrying polling step (${Math.floor((Date.now() - startedAt) / 1000)}s elapsed)`,
          );
          await sleep(
            Math.min(POLL_INTERVAL_MS, Math.max(0, deadline - Date.now())),
          );
          continue;
        }
        const elapsedMs = Date.now() - startedAt;
        if (response.status === 200) {
          record.status = "passed";
          console.log(
            `${name}, passed after ${(elapsedMs / 1000).toFixed(1)}s (${record.requests} requests)`,
          );
          return;
        }
        if (!poll || response.status !== 202)
          throw new Error(
            `${name} failed (HTTP ${response.status}). Inspect structured smoke assertion logs`,
          );
        const phase = response.phase ?? "pending";
        if (phase !== lastPhase || Date.now() >= nextProgressAt) {
          console.log(
            `${name}, ${phase}, ${(elapsedMs / 1000).toFixed(1)}s elapsed, ${record.requests} requests`,
          );
          if (phase !== lastPhase) record.phases.push({ elapsedMs, phase });
          lastPhase = phase;
          nextProgressAt = Date.now() + 15000;
        }
        await sleep(
          Math.min(POLL_INTERVAL_MS, Math.max(0, deadline - Date.now())),
        );
      } while (Date.now() < deadline);
      throw new Error(
        `${name} timed out after ${settings.pollTimeoutMs / 1000}s. Last phase was ${lastPhase || "unknown"}`,
      );
    } finally {
      record.durationMs = Date.now() - startedAt;
    }
  }

  let failure: unknown;
  try {
    await step("upload-new", {
      testing: true,
      type: "upload-new",
      uploadId: runId,
    });
    let records = 0;
    for (const [index, size] of chunkSizes.entries()) {
      records += size;
      await step(`upload-data[${index}]`, {
        data: buildUsersChunk(index, size, {
          title: runId,
          ...(email && index === 0 ? { email } : {}),
        }),
        index,
        type: "upload-data",
        uploadId: runId,
      });
    }
    await step("upload-complete", { type: "upload-complete", uploadId: runId });
    const assertReferences = (baseline?: "remember" | "verify") =>
      step(
        `references${baseline ? ` (${baseline})` : ""}`,
        {
          type: "import-smoke-assert",
          ...target,
          expectedStatus: "DONE",
          referenceSync: {
            baseline,
            email,
            expectedUnmatched: records - (email ? 1 : 0),
            uploadId: runId,
          },
          uploadId: runId,
        },
        true,
      );

    const startImport = (name: string) =>
      step(name, { type: "import-start", ...target, testing: true });

    await startImport("import-start");
    await step(
      "native objects",
      {
        type: "import-smoke-assert",
        ...target,
        expectedStatus: "DONE",
        objects: {
          expectedCount: records,
          objectTypeName: OBJECT_TYPE_NAME,
          runId,
        },
        uploadId: runId,
      },
      true,
    );
    await assertReferences(email ? "remember" : undefined);
    if (email) {
      await startImport("import-start (identical repeat)");
      await assertReferences("verify");
    }
    console.log(
      `functional assertions passed, records=${records}, expected unmatched=${records - (email ? 1 : 0)}`,
    );
  } catch (error) {
    failure = error;
    console.error(
      `smoke assertions failed for ${runId}. Preserving completed input until lifecycle cleanup succeeds`,
    );
    try {
      await step("upload-abort (staging)", {
        type: "upload-abort",
        uploadId: runId,
      });
    } catch {
      console.error("Staging cleanup also failed");
    }
  }
  try {
    await step(
      "asset cleanup",
      {
        type: "import-smoke-cleanup",
        ...target,
        objectTypeName: OBJECT_TYPE_NAME,
        runId,
      },
      true,
    );
    await step("test upload pruning", {
      keepN: 0,
      testing: true,
      type: "prune",
    });
  } catch (error) {
    failure ??= error;
    console.error(
      "Lifecycle cleanup failed. Completed input was retained for recovery",
    );
  } finally {
    report.finishedAt = new Date().toISOString();
    report.durationMs = Date.now() - start;
    report.status = failure ? "failed" : "passed";
    if (reportPath)
      await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, {
        mode: 0o600,
      });
  }
  if (failure) throw failure;
  console.log(
    `smoke test passed, runId=${runId} duration=${(report.durationMs / 1000).toFixed(1)}s`,
  );
  return report;
}
