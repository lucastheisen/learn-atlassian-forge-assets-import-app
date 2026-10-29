import type { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fixtureScope,
  makeRun,
  storage,
} from "../../../tests/helpers/reference-storage";
import { runKey } from "../../lib/kv-reference";
import { executionStatus } from "../../lib/reference-assets";
import { importSmokeAssertCommand } from "./import-smoke-assert";

const { client } = vi.hoisted(() => ({
  client: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("../../lib/forge-clients", () => ({
  assetsClient: () => client,
  unwrap: (result: unknown) => result,
}));

vi.mock("../../lib/reference-assets", () => ({ executionStatus: vi.fn() }));

vi.mock("@forge/kvs", async () => {
  const { storage: memory } = await import(
    "../../../tests/helpers/reference-storage.js"
  );
  return {
    WhereConditions: { beginsWith: (prefix: string) => prefix },
    kvs: memory.api,
  };
});

const action = {
  type: "import-smoke-assert" as const,
  ...fixtureScope,
  expectedStatus: "DONE" as const,
  uploadId: "upload",
};

const assert = () =>
  importSmokeAssertCommand(
    action,
    {},
    {} as WebTriggerRequest,
    {} as WebTriggerContext,
  );

beforeEach(() => {
  storage.reset();
  vi.mocked(executionStatus).mockReset();
  client.GET.mockReset();
  client.POST.mockReset();
});

describe("importSmokeAssertCommand", () => {
  it("checks the total object count beyond a single 100-object page", async () => {
    const run = makeRun({ phase: "complete" });
    storage.values.set(runKey(run), run);
    vi.mocked(executionStatus).mockResolvedValue({ status: "DONE" });
    client.POST.mockResolvedValue({ totalCount: 250 });
    expect(
      await importSmokeAssertCommand(
        {
          ...action,
          objects: {
            expectedCount: 250,
            objectTypeName: "Smoke User",
            runId: "upload",
          },
        },
        {},
        {} as WebTriggerRequest,
        {} as WebTriggerContext,
      ),
    ).toEqual({ outputKey: "status-ok" });
    expect(client.POST).toHaveBeenCalledWith(
      "/object/aql/totalcount",
      expect.any(Object),
    );
  });

  it("reports the current native phase using that run's execution", async () => {
    const run = makeRun({ nativeTerminal: false, phase: "ingesting" });
    storage.values.set(runKey(run), run);
    vi.mocked(executionStatus).mockResolvedValue({ status: "INGESTING" });
    expect(await assert()).toEqual({ outputKey: "smoke-pending-ingesting" });
    expect(vi.mocked(executionStatus).mock.calls[0]?.[0].executionId).toBe(
      run.executionId,
    );
    expect(client.GET).not.toHaveBeenCalled();
  });

  it("reports the newly queued request without accepting the preceding execution's DONE", async () => {
    for (const run of [
      makeRun({ id: "a", phase: "complete" }),
      makeRun({ executionId: undefined, id: "b", phase: "queued" }),
    ])
      storage.values.set(runKey(run), run);
    expect(await assert()).toEqual({ outputKey: "smoke-pending-queued" });
    expect(client.GET).not.toHaveBeenCalled();
    expect(executionStatus).not.toHaveBeenCalled();
  });

  it("returns a terminal failure instead of polling forever after a lifecycle error", async () => {
    const run = makeRun({ failure: "processing_failed", phase: "complete" });
    storage.values.set(runKey(run), run);
    expect(await assert()).toEqual({ outputKey: "smoke-failed" });
  });
});
