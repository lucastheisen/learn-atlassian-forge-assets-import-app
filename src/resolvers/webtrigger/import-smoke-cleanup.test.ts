import type { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fixtureScope,
  makeRun,
  storage,
} from "../../../tests/helpers/reference-storage";
import { activeRunKey, runKey } from "../../lib/kv-reference";
import { referenceRequest } from "../../lib/reference-api";
import { ContinueLater, ProductRequestError } from "../../lib/reference-types";
import { importSmokeCleanupCommand } from "./import-smoke-cleanup";
import { smokeBaselineKey } from "./import-smoke-reference";

vi.mock("@forge/kvs", async () => {
  const { storage: memory } = await import(
    "../../../tests/helpers/reference-storage.js"
  );
  return {
    WhereConditions: { beginsWith: (prefix: string) => prefix },
    kvs: memory.api,
  };
});

vi.mock("../../lib/reference-api", () => ({ referenceRequest: vi.fn() }));

const action = {
  ...fixtureScope,
  objectTypeName: "Smoke User",
  runId: "upload",
  type: "import-smoke-cleanup" as const,
};

const cleanup = () =>
  importSmokeCleanupCommand(
    action,
    {},
    {} as WebTriggerRequest,
    {} as WebTriggerContext,
  );

beforeEach(() => {
  vi.useFakeTimers();
  storage.reset();
  vi.mocked(referenceRequest).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("importSmokeCleanupCommand", () => {
  it("deletes all 250 objects over bounded pages and confirms an empty final query", async () => {
    const remaining = new Set(
      Array.from({ length: 250 }, (_, index) => String(index)),
    );
    const baseline = smokeBaselineKey(fixtureScope, action.runId);
    storage.values.set(baseline, { updated: "baseline" });
    let active = 0;
    let maximum = 0;
    vi.mocked(referenceRequest).mockImplementation(
      async (path, budget, options) => {
        budget.check();
        if (options?.method === "POST") {
          expect(path.value).toContain("maxResults=20");
          return { values: [...remaining].slice(0, 20).map((id) => ({ id })) };
        }
        active++;
        maximum = Math.max(maximum, active);
        await Promise.resolve();
        remaining.delete(path.value.split("/").at(-1) ?? "");
        active--;
        return undefined;
      },
    );
    for (let page = 0; page < 13; page++) {
      expect(await cleanup()).toEqual({ outputKey: "smoke-pending-objects" });
      expect(storage.values.has(baseline)).toBe(true);
    }
    expect(remaining.size).toBe(0);
    expect(maximum).toBe(4);
    expect(await cleanup()).toEqual({ outputKey: "status-ok" });
    expect(storage.values.has(baseline)).toBe(false);
  });

  it("keeps cleanup pending while the import lifecycle is active", async () => {
    const run = makeRun({ phase: "processing" });
    storage.values.set(runKey(run), run);
    storage.values.set(activeRunKey, runKey(run));
    expect(await cleanup()).toEqual({ outputKey: "smoke-pending-processing" });
    expect(referenceRequest).not.toHaveBeenCalled();
  });

  it("waits for all issued deletes before returning a failure", async () => {
    let release: (() => void) | undefined;
    let started: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => {
      started = resolve;
    });
    vi.mocked(referenceRequest).mockImplementation(
      async (path, _budget, options) => {
        if (options?.method === "POST")
          return { values: [{ id: "a" }, { id: "b" }] };
        if (path.value.endsWith("/a")) throw new ProductRequestError(403);
        await new Promise<void>((resolve) => {
          release = resolve;
          started?.();
        });
        return undefined;
      },
    );
    let finished = false;
    const result = expect(cleanup())
      .rejects.toMatchObject({ status: 403 })
      .then(() => {
        finished = true;
      });
    await waiting;
    expect(finished).toBe(false);
    release?.();
    await result;
  });

  it("yields between groups when its request budget is exhausted", async () => {
    let deletes = 0;
    vi.mocked(referenceRequest).mockImplementation(
      async (_path, budget, options) => {
        budget.check();
        if (options?.method === "POST")
          return {
            values: Array.from({ length: 20 }, (_, index) => ({
              id: String(index),
            })),
          };
        await Promise.resolve();
        if (++deletes === 1) vi.advanceTimersByTime(6_000);
        return undefined;
      },
    );
    expect(await cleanup()).toEqual({ outputKey: "smoke-pending-objects" });
    expect(deletes).toBe(4);
    vi.mocked(referenceRequest).mockRejectedValue(new ContinueLater(5));
    expect(await cleanup()).toEqual({ outputKey: "smoke-pending-objects" });
  });
});
