import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";
import { runImportSmoke } from "./import-smoke.js";
import {
  callWebTrigger,
  WebTriggerTransportError,
} from "./webtrigger-client.js";

vi.mock("./webtrigger-client.js", async (original) => ({
  ...(await original<typeof import("./webtrigger-client.js")>()),
  callWebTrigger: vi.fn(),
}));

const connection = { secret: "secret", url: "https://example.invalid" };

const target = { importSourceId: "source", workspaceId: "workspace" };

const UsersSchema = z.object({
  users: z.array(z.object({ email: z.string(), name: z.string() })),
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(callWebTrigger)
    .mockReset()
    .mockResolvedValue({ status: 200, title: "success" });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("runImportSmoke", () => {
  it("bounds transport retries to the polling deadline", async () => {
    vi.mocked(callWebTrigger).mockImplementation(async (action) => {
      if (action.objects) throw new WebTriggerTransportError();
      return { status: 200, title: "success" };
    });
    const result = expect(runImportSmoke(connection, target)).rejects.toThrow(
      "timed out",
    );
    await vi.advanceTimersByTimeAsync(300000);
    await result;
    expect(
      vi.mocked(callWebTrigger).mock.calls.filter(([action]) => action.objects)
        .length,
    ).toBeLessThanOrEqual(101);
    expect(
      vi
        .mocked(callWebTrigger)
        .mock.calls.some(([action]) => action.type === "import-smoke-cleanup"),
    ).toBe(true);
  });

  it("does not hide protocol errors as pending processing", async () => {
    vi.mocked(callWebTrigger).mockImplementation(async (action) => {
      if (action.objects) throw new Error("invalid response metadata");
      return { status: 200, title: "success" };
    });
    await expect(runImportSmoke(connection, target)).rejects.toThrow(
      "invalid response metadata",
    );
    expect(
      vi.mocked(callWebTrigger).mock.calls.filter(([action]) => action.objects),
    ).toHaveLength(1);
  });

  it.each([
    401, 403, 409, 500,
  ])("fails immediately for HTTP %s and still cleans up", async (status) => {
    vi.mocked(callWebTrigger).mockImplementation(async (action) => ({
      status: action.objects ? status : 200,
      title: "result",
    }));
    await expect(runImportSmoke(connection, target)).rejects.toThrow(
      `HTTP ${status}`,
    );
    expect(
      vi.mocked(callWebTrigger).mock.calls.filter(([action]) => action.objects),
    ).toHaveLength(1);
    expect(
      vi
        .mocked(callWebTrigger)
        .mock.calls.some(([action]) => action.type === "import-smoke-cleanup"),
    ).toBe(true);
  });

  it("generates 250 distinct users across larger chunks with exactly one real account", async () => {
    const report = await runImportSmoke(
      connection,
      target,
      "known@example.test",
      undefined,
      {
        requireContinuation: true,
        userCount: 250,
      },
    );
    const users = vi
      .mocked(callWebTrigger)
      .mock.calls.filter(([action]) => action.type === "upload-data")
      .flatMap(([action]) => UsersSchema.parse(action.data).users);
    expect(users).toHaveLength(250);
    expect(new Set(users.map((user) => user.name)).size).toBe(250);
    expect(new Set(users.map((user) => user.email)).size).toBe(250);
    expect(
      users.filter((user) => user.email === "known@example.test"),
    ).toHaveLength(1);
    expect(report).toMatchObject({
      inputChunks: 6,
      inputRecords: 250,
      requireContinuation: true,
    });
    const checks = vi
      .mocked(callWebTrigger)
      .mock.calls.filter(([action]) => action.referenceSync);
    expect(checks).toHaveLength(2);
    for (const [action] of checks)
      expect(action.referenceSync).toMatchObject({ expectedUnmatched: 249 });
    expect(
      vi
        .mocked(callWebTrigger)
        .mock.calls.find(([action]) => action.objects)?.[0].objects,
    ).toMatchObject({ expectedCount: 250 });
  });

  it("honors a custom polling deadline and rejects invalid sizes before uploading", async () => {
    await expect(
      runImportSmoke(connection, target, undefined, undefined, {
        userCount: 0,
      }),
    ).rejects.toThrow();
    expect(callWebTrigger).not.toHaveBeenCalled();
    vi.mocked(callWebTrigger).mockImplementation(async (action) => {
      if (action.objects) throw new WebTriggerTransportError();
      return { status: 200, title: "success" };
    });
    const result = expect(
      runImportSmoke(connection, target, undefined, undefined, {
        pollTimeoutMs: 30_000,
      }),
    ).rejects.toThrow("timed out after 30s");
    await vi.advanceTimersByTimeAsync(30_000);
    await result;
  });

  it("prints pending phases, correlates all checks to this upload, and requires unmatched reasons", async () => {
    let first = true;
    vi.mocked(callWebTrigger).mockImplementation(async (action) => {
      if (action.objects && first) {
        first = false;
        return { phase: "ingesting", status: 202, title: "pending" };
      }
      return { status: 200, title: "success" };
    });
    const result = runImportSmoke(connection, target, "known@example.test");
    await vi.runAllTimersAsync();
    const report = await result;
    expect(report.status).toBe("passed");
    expect(
      report.steps.find(({ name }) => name === "native objects")?.phases,
    ).toEqual([{ elapsedMs: 0, phase: "ingesting" }]);
    const checks = vi
      .mocked(callWebTrigger)
      .mock.calls.filter(([action]) => action.type === "import-smoke-assert");
    for (const [action, , signal] of checks) {
      expect(action.uploadId).toBe(report.uploadId);
      expect(signal).toBeInstanceOf(AbortSignal);
    }
    expect(
      checks
        .filter(([action]) => action.referenceSync)
        .map(([action]) => action.referenceSync),
    ).toEqual([
      expect.objectContaining({ baseline: "remember", expectedUnmatched: 14 }),
      expect.objectContaining({ baseline: "verify", expectedUnmatched: 14 }),
    ]);
    expect(JSON.stringify(report)).not.toContain("known@example.test");
    expect(JSON.stringify(report)).not.toContain("secret");
    expect(JSON.stringify(vi.mocked(console.log).mock.calls)).toContain(
      "ingesting",
    );
  });
});
